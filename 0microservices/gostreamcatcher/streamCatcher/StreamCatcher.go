package streamcatcher

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"microsomes.com/stgo/streamCatcher/streamutil"
	"microsomes.com/stgo/utils"
)

type StreamCatcher struct {
	JobQueue                  chan utils.SteamJob
	WorkQueue                 chan utils.SteamJob
	ConcurrentLimit           int
	JobStatuses               map[string]utils.JobStatus
	JobStatusEvents           map[string]utils.JobStatusEvents
	WorkerStatus              utils.WorkerStatus
	GroupLinks                map[string][]string
	StreamCatcherSocketServer *StreamCatcherSocketServer
}

func (s *StreamCatcher) ShouldAdd(job utils.SteamJob) bool {

	if _, ok := s.JobStatuses[job.JobID]; ok {
		return false
	}

	return true
}

func (s *StreamCatcher) GetWorkerStatus() utils.WorkerStatus {
	return s.WorkerStatus
}

func (s *StreamCatcher) GetJobStatus(id string) utils.JobStatus {
	return s.JobStatuses[id]
}

func (s *StreamCatcher) GetAllStatusesByJobID(id string) []utils.JobStatus {
	return s.JobStatusEvents[id]
}

func NewStreamCatcher(scsocket *StreamCatcherSocketServer) *StreamCatcher {
	return &StreamCatcher{
		JobQueue:                  make(chan utils.SteamJob, 1),
		WorkQueue:                 make(chan utils.SteamJob, 100),
		ConcurrentLimit:           10,
		JobStatuses:               make(map[string]utils.JobStatus),
		JobStatusEvents:           make(map[string]utils.JobStatusEvents),
		WorkerStatus:              utils.WorkerStatus{},
		GroupLinks:                make(map[string][]string),
		StreamCatcherSocketServer: scsocket,
	}
}

type ToSendStatusHook struct {
	Job    utils.SteamJob
	Status utils.JobStatus
}

func (s *StreamCatcher) sendStatusToCallback(job *utils.SteamJob, status utils.JobStatus) {
	httpclient := http.Client{
		Timeout: 10 * time.Second,
	}

	statusToSend := ToSendStatusHook{
		Job:    *job,
		Status: status,
	}

	bytet, err := json.Marshal(statusToSend)

	if err != nil {
		fmt.Println("Error: ", err)
		return
	}

	req, err := http.NewRequest("POST", job.UpdateHook, bytes.NewBuffer(bytet))

	if err != nil {
		fmt.Println("Error: ", err)
		return
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := httpclient.Do(req)

	if err != nil {
		fmt.Println("Error: ", err)
		return
	}

	defer resp.Body.Close()

	fmt.Println("Response: ", resp.Status)

}

func (s *StreamCatcher) AddStatusEvent(job *utils.SteamJob, status string, result []string) {

	nstatus := utils.JobStatus{
		State:  status,
		Result: result,
		Time:   time.Now().Unix(),
	}

	s.StreamCatcherSocketServer.BroadcastEvents(utils.JobEvent{
		Job:    *job,
		Status: nstatus,
	})

	if status == "queued" {
		s.WorkerStatus.TotalQueue++
		s.WorkerStatus.TotalDuration += job.TimeoutSeconds
	}

	if status == "recording" {
		s.WorkerStatus.TotalQueue--
		s.WorkerStatus.TotalRecording++
	}

	if status == "done" {
		s.WorkerStatus.TotalRecording--
		s.WorkerStatus.TotalDone++
		s.WorkerStatus.TotalDuration -= job.TimeoutSeconds

		if job.Groupid != "" {
			s.GroupLinks[job.Groupid] = append(s.GroupLinks[job.Groupid], result...)
		}

		fmt.Println("Group links: ", s.GroupLinks)

		formatted := []string{}

		for _, link := range s.GroupLinks[job.Groupid] {
			formatted = append(formatted, "https://pub-cf9c58b47aaa413eadbc9d4fba77649a.r2.dev/"+link)
		}

		s.GroupLinks[job.Groupid] = formatted

	}

	if status == "error" {
		s.WorkerStatus.TotalRecording--
	}

	s.JobStatusEvents[job.JobID] = append(s.JobStatusEvents[job.JobID], nstatus)

	s.JobStatuses[job.JobID] = nstatus

	s.sendStatusToCallback(job, nstatus)

}

func (s *StreamCatcher) AddJob(job utils.SteamJob) {
	fmt.Println("Adding job to job queue: ", job.JobID)
	s.AddStatusEvent(&job, "queued", []string{})
	s.JobQueue <- job
}

func (s *StreamCatcher) StartWork(wg *sync.WaitGroup) {
	defer wg.Done()

	for Job := range s.WorkQueue {

		s.AddStatusEvent(&Job, "recording", []string{})

		data, err := streamutil.ProcessDownload(Job.YoutubeLink, Job.TimeoutSeconds, Job.JobID, Job.IsStart)
		if err != nil {
			fmt.Println("Error: ", err)
			s.AddStatusEvent(&Job, "error", []string{err.Error()})
		}

		s.AddStatusEvent(&Job, "attempting to upload", data.Paths)

		uploader := streamutil.DLPUploader{}

		var allDownloadPaths []string

		for index, path := range data.Paths {

			f, err := os.Open("./tmp/" + path)
			defer f.Close()

			if err != nil {
				fmt.Println("Error: ", err)
				s.AddStatusEvent(&Job, "error uploading:"+path, []string{err.Error()})
				return
			}

			indexString := strconv.Itoa(index)

			fileUrl, err := uploader.UploadFile(f, Job.JobID+".mp4", indexString)

			if err != nil {
				fmt.Println("Error: ", err)
				s.AddStatusEvent(&Job, "error uploading:"+path, []string{err.Error()})
				return
			}

			allDownloadPaths = append(allDownloadPaths, fileUrl)

			// remove file
			err = os.Remove("./tmp/" + path)
			if err != nil {
				fmt.Println("Error: ", err)
				s.AddStatusEvent(&Job, "error removing:"+path, []string{err.Error()})
				return
			}

			s.AddStatusEvent(&Job, "uploaded:"+path, []string{})

		}

		s.AddStatusEvent(&Job, "done", allDownloadPaths)

		fmt.Println("Processed: ", Job.JobID, " done")
	}

	fmt.Println("interrupted")

}

func (s *StreamCatcher) StartQueues(ctx context.Context) {
	for {
		select {
		case job := <-s.JobQueue:
			s.WorkQueue <- job
		case <-ctx.Done():
			close(s.WorkQueue)
			close(s.JobQueue)
			return
		}
	}
}

func (s *StreamCatcher) StartAllWorkers(diewg *sync.WaitGroup) {
	wg1 := &sync.WaitGroup{}
	wg1.Add(s.ConcurrentLimit)
	for i := 0; i < s.ConcurrentLimit; i++ {
		go s.StartWork(wg1)
	}
	wg1.Wait()
	diewg.Done()
	fmt.Println("work done die")
}
