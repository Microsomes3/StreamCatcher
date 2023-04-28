package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	muxerhelper "microsomes.com/muxingservice/MuxerHelper"
)

type MuxingService struct {
	JobQueue        chan *muxerhelper.GoMuxJob
	Status          map[string][]*muxerhelper.GoMuxStatus
	JobDoneCallback func(job *muxerhelper.GoMuxJob, status string)
}

func NewMuzingService(jobDoneCallback func(job *muxerhelper.GoMuxJob, string string)) *MuxingService {
	return &MuxingService{
		JobQueue:        make(chan *muxerhelper.GoMuxJob, 100),
		Status:          make(map[string][]*muxerhelper.GoMuxStatus),
		JobDoneCallback: jobDoneCallback,
	}
}

func (mx *MuxingService) addStatus(job *muxerhelper.GoMuxJob, status string, result muxerhelper.MuxResult) {

	if _, ok := mx.Status[job.JobID]; !ok {
		mx.Status[job.JobID] = make([]*muxerhelper.GoMuxStatus, 0)
	}

	gomuxstatus := &muxerhelper.GoMuxStatus{
		State:  status,
		Time:   time.Now().Unix(),
		Result: result,
	}

	mx.Status[job.JobID] = append(mx.Status[job.JobID], gomuxstatus)

	err := mx.sendUpdateHook(job, gomuxstatus)

	fmt.Println(err)

}

type UpdateHookJobStatus struct {
	Job    *muxerhelper.GoMuxJob    `json:"Job"`
	Status *muxerhelper.GoMuxStatus `json:"Status"`
}

func (mx *MuxingService) sendUpdateHook(j *muxerhelper.GoMuxJob, status *muxerhelper.GoMuxStatus) error {

	fmt.Println("Sending update hook")

	httpClient := http.Client{
		Timeout: time.Second * 10,
	}

	us := UpdateHookJobStatus{
		Job:    j,
		Status: status,
	}

	statusB, err := json.Marshal(us)

	if err != nil {
		return err
	}

	//use httpClient

	req, err := http.NewRequest(http.MethodPost, j.UpdateHook, bytes.NewBuffer(statusB))

	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	res, err := httpClient.Do(req)

	if err != nil {
		return err
	}

	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("Error sending update hook")
	}

	bytes, err := ioutil.ReadAll(res.Body)

	if err != nil {
		return err
	}

	fmt.Println(string(bytes))

	return nil

}

func (ms *MuxingService) Start(wg *sync.WaitGroup, ctx context.Context) {
	for {
		select {
		case job := <-ms.JobQueue:
			fmt.Println("Starting mux job")
			ms.addStatus(job, "started", muxerhelper.MuxResult{})

			result, err := muxerhelper.PerformMuxingJob(job.JobID, job.VideoLink, job.AudioLink, "started")
			if err != nil {
				ms.addStatus(job, "error", result)
			} else {
				// ms.addStatus(job, result.Status, result)
			}
			fmt.Println("=", result.Duration)
			fmt.Println("=", result.OutputFile)
			fmt.Println("=", result.R2File)
			fmt.Println("=", result.Size)
			fmt.Println("=", result.Status)

			ms.addStatus(job, "done", result)
			fmt.Println("Mux job done")
			ms.JobDoneCallback(job, "done")

		case <-ctx.Done():
			fmt.Println("Muxing service shutting down")
			time.Sleep(1 * time.Second)
			close(ms.JobQueue)
			return
		default:
			// fmt.Println("No jobs to mux")
			time.Sleep(1 * time.Second)
		}
	}
}

func (ms *MuxingService) QueueMuxJob(job *muxerhelper.GoMuxJob) {
	fmt.Println("Queuing mux job")
	ms.JobQueue <- job
}

func main() {

	jobid := os.Getenv("jobid")
	reqid := os.Getenv("reqid")
	videoLink := os.Getenv("videoLink")
	audioLink := os.Getenv("audioLink")
	updateHook := os.Getenv("updatehook")

	fmt.Println("jobid:" + jobid)

	ctx, cancelFunc := context.WithCancel(context.Background())

	jc := func(job *muxerhelper.GoMuxJob, status string) {
		fmt.Println("Job done callback")
		fmt.Println(job)
		fmt.Println("status:" + status)
		cancelFunc()
		os.Exit(0)

	}

	musingService := NewMuzingService(jc)

	job := muxerhelper.GoMuxJob{
		JobID:      jobid,
		ReqID:      reqid,
		VideoLink:  videoLink,
		AudioLink:  audioLink,
		UpdateHook: updateHook,
		Type:       "mux",
	}

	wg := &sync.WaitGroup{}

	go musingService.Start(wg, ctx)
	go musingService.QueueMuxJob(&job)

	//wait for sigint signal
	chn := make(chan os.Signal, 1)

	signal.Notify(chn, syscall.SIGINT, syscall.SIGTERM)

	<-chn
	cancelFunc()
	wg.Wait()

	fmt.Println("Muxing service stopped")

}
