package streamcatcher

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"sync"
	"time"

	"microsomes.com/stgo/streamCatcher/streamutil"
	"microsomes.com/stgo/utils"
)

type StreamCatcher struct {
	ReferenceJob              utils.SteamJob
	JobQueue                  chan utils.SteamJob
	WorkQueue                 chan utils.SteamJob
	ConcurrentLimit           int
	JobStatuses               map[string]utils.JobStatus
	JobStatusEvents           map[string]utils.JobStatusEvents
	WorkerStatus              utils.WorkerStatus
	GroupLinks                map[string][]string
	StreamCatcherSocketServer *StreamCatcherSocketServer
	Callback                  func(utils.SteamJob)
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

func NewStreamCatcher(refJob utils.SteamJob, scsocket *StreamCatcherSocketServer, callback func(utils.SteamJob)) *StreamCatcher {
	return &StreamCatcher{
		ReferenceJob:              refJob,
		JobQueue:                  make(chan utils.SteamJob, 10),
		WorkQueue:                 make(chan utils.SteamJob, 100),
		ConcurrentLimit:           1,
		JobStatuses:               make(map[string]utils.JobStatus),
		JobStatusEvents:           make(map[string]utils.JobStatusEvents),
		WorkerStatus:              utils.WorkerStatus{},
		GroupLinks:                make(map[string][]string),
		StreamCatcherSocketServer: scsocket,
		Callback:                  callback,
	}
}

type ToSendStatusHook struct {
	Job          utils.SteamJob
	Status       utils.JobStatus
	ReasonForEnd utils.ReasonToSend
}

func (s *StreamCatcher) sendStatusToMissionControl(statusToSend utils.JobStatusV2) bool {

	httpCliemt := http.Client{
		Timeout: 10 * time.Second,
	}

	statusBytes, err := json.Marshal(statusToSend)

	if err != nil {
		return false
	}

	req, err := http.NewRequest("POST", s.ReferenceJob.UpdateHook, bytes.NewBuffer(statusBytes))

	if err != nil {
		return false
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := httpCliemt.Do(req)

	if err != nil {
		return false
	}

	defer resp.Body.Close()

	return true
}

func (s *StreamCatcher) sendStatusToCallback(job *utils.SteamJob, status utils.JobStatus) {
	httpclient := http.Client{
		Timeout: 10 * time.Second,
	}

	statusToSend := ToSendStatusHook{
		Job:          *job,
		Status:       status,
		ReasonForEnd: utils.ReasonToSend{},
	}

	if status.State == "done" {
		if status.Result == nil {
			status.State = "error"
			status.Result = []string{"No result"}
		}
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

	datab, err := io.ReadAll(resp.Body)

	if err != nil {
		fmt.Println("Error: ", err)
		return
	}

	fmt.Println("Response: ", string(datab))

}

func (s *StreamCatcher) AddStatusEventV2(opts ...utils.StatusOptions) {
	defaultOpts := utils.JobStatusV2{
		DateTime:   time.Now().Unix(),
		JobDetails: s.ReferenceJob,
	}
	for _, opt := range opts {
		opt(&defaultOpts)
	}

	s.sendStatusToMissionControl(defaultOpts)
}

func (s *StreamCatcher) AddStatusEvent(job *utils.SteamJob, status string, result []string) {

	fmt.Println("AddStatusEvent: ", job.JobID, status)
	nstatus := utils.JobStatus{
		State:  status,
		Result: result,
		Time:   time.Now().Unix(),
	}

	if s.StreamCatcherSocketServer != nil {

		s.StreamCatcherSocketServer.BroadcastEvents(utils.JobEvent{
			Job:    *job,
			Status: nstatus,
		})
	}

	if status == "queued" {
		s.WorkerStatus.TotalQueue++
		s.WorkerStatus.TotalDuration += job.TimeoutSeconds
	}

	if status == "recording" {
		s.WorkerStatus.TotalQueue--
		s.WorkerStatus.TotalRecording++
	}

	if status == "error" {
		s.WorkerStatus.TotalRecording--
		s.JobStatusEvents[job.JobID] = append(s.JobStatusEvents[job.JobID], nstatus)
		s.JobStatuses[job.JobID] = nstatus
		s.sendStatusToCallback(job, nstatus)

		return
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

	s.JobStatusEvents[job.JobID] = append(s.JobStatusEvents[job.JobID], nstatus)

	s.JobStatuses[job.JobID] = nstatus

	s.sendStatusToCallback(job, nstatus)

}

func (s *StreamCatcher) AddJob(job utils.SteamJob) {
	s.AddStatusEventV2(utils.WithStatusCode("QUEUED"), utils.WithStatusReason("Job is Queued for recording"))
	s.JobQueue <- job
}

func (s *StreamCatcher) SendProgressionData(output string, done chan bool) {
	//every 5 minutes
	ticker := time.NewTicker(5 * time.Minute)
	for {
		select {
		case <-done:
			return
		case <-ticker.C:
			re := regexp.MustCompile(`[0-9]+/[0-9]+`)
			match := re.FindString(output)
			fmt.Println(match)

			if match != "" {
				fmt.Println("match found")
			} else {

				fmt.Println("match not found")
			}
		}
	}
}

func (s *StreamCatcher) StartWork(wg *sync.WaitGroup) {

	for Job := range s.WorkQueue {

		s.AddStatusEventV2(utils.WithStatusCode("RECORDING"), utils.WithStatusReason("Job is being recorded"))

		_, uploadLinks, err := streamutil.ProcessDownload(s.AddStatusEventV2, Job, s.SendProgressionData)
		if err != nil {
			fmt.Println("Error: ", err)
			s.AddStatusEvent(&Job, "error", []string{err.Error()})
			if s.Callback != nil {

				s.Callback(Job)
			}

			return
		}

		fmt.Println("Upload done: ", uploadLinks)

		s.AddStatusEventV2(utils.WithStatusCode("DONE"), utils.WithStatusReason("Job is done"),
			utils.WithResult(uploadLinks),
		)

		if s.Callback != nil {

			s.Callback(Job)
		}

		fmt.Println("Processed: ", Job.JobID, " done")
	}

	fmt.Println("interrupted")
	wg.Done()

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
	fmt.Println("work done die")
}
