package main

import (
	"context"
	"fmt"
	"time"

	"microsomes.com/muxingservice/muxerhelper"
)

type GoMuxJob struct {
	JobId     string `json:"job_id"`
	AudioLink string `json:"audio_link"`
	VideoLink string `json:"video_link"`
}

type GoMuxStatus struct {
	Job     *GoMuxJob
	Status  string
	Created time.Time
}

type MuxingService struct {
	JobQueue        chan *GoMuxJob
	Status          map[string][]*GoMuxStatus
	JobDoneCallback func(job *GoMuxJob, status string)
}

func NewMuzingService(jobDoneCallback func(job *GoMuxJob, string string)) *MuxingService {
	return &MuxingService{
		JobQueue:        make(chan *GoMuxJob, 100),
		Status:          make(map[string][]*GoMuxStatus),
		JobDoneCallback: jobDoneCallback,
	}
}

func (mx *MuxingService) addStatus(job *GoMuxJob, status string) {

	if _, ok := mx.Status[job.JobId]; !ok {
		mx.Status[job.JobId] = make([]*GoMuxStatus, 0)
	}

	mx.Status[job.JobId] = append(mx.Status[job.JobId], &GoMuxStatus{
		Job:     job,
		Status:  status,
		Created: time.Now(),
	})

}

func (ms *MuxingService) Start(ctx context.Context) {
	for {
		select {
		case job := <-ms.JobQueue:
			fmt.Println("Starting mux job")
			ms.addStatus(job, "started")

			result, err := muxerhelper.PerformMuxingJob(job.VideoLink, job.AudioLink, "started")
			if err != nil {
				ms.addStatus(job, "error")
			} else {
				ms.addStatus(job, result.Status)
			}

			ms.addStatus(job, "done")
			fmt.Println("Mux job done")
			ms.JobDoneCallback(job, "done")

		case <-ctx.Done():
			fmt.Println("Muxing service shutting down")
			return
		default:
			// fmt.Println("No jobs to mux")
			time.Sleep(1 * time.Second)
		}
	}
}

func (ms *MuxingService) QueueMuxJob(job *GoMuxJob) {
	fmt.Println("Queuing mux job")
	ms.JobQueue <- job
}

func main() {

	jc := func(job *GoMuxJob, status string) {
		fmt.Println("Job done callback")
		fmt.Println(job)
		fmt.Println(status)
	}

	musingService := NewMuzingService(jc)

	job := GoMuxJob{
		JobId:     "1234",
		VideoLink: "https://d213lwr54yo0m8.cloudfront.net/example_video.mkv",
		AudioLink: "https://d213lwr54yo0m8.cloudfront.net/example_audio.mkv",
	}

	ctx, _ := context.WithCancel(context.Background())

	go musingService.Start(ctx)
	go musingService.QueueMuxJob(&job)

	//wait for sigint signal
	select {}

}
