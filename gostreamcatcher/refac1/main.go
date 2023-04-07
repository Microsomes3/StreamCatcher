package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

type SteamJob struct {
	JobID          string `json:"jobId"`
	YoutubeLink    string `json:"youtubeLink"`
	TimeoutSeconds int    `json:"timeout"`
	IsStart        bool   `json:"isStart"`
	UpdateHook     string `json:"updateHook"`
}

type StreamCatcher struct {
	jobQueue        chan SteamJob
	workQueue       chan SteamJob
	concurrentLimit int
}

func (s *StreamCatcher) AddJob(job SteamJob) {
	s.jobQueue <- job
}

func (s *StreamCatcher) startWork(wg *sync.WaitGroup) {
	defer wg.Done()

	for Job := range s.workQueue {
		fmt.Println("Job: ", Job.JobID)
		time.Sleep(20 * time.Second)
		fmt.Println("Job: ", Job.JobID, " done")
	}

	fmt.Println("interrupted")

}

func (s *StreamCatcher) startQueues(ctx context.Context) {
	for {
		select {
		case job := <-s.jobQueue:
			s.workQueue <- job
		case <-ctx.Done():
			close(s.workQueue)
			close(s.jobQueue)
			return
		}
	}
}

func main() {
	streamCatcher := StreamCatcher{
		jobQueue:        make(chan SteamJob, 5000), //pending jobs
		workQueue:       make(chan SteamJob, 100),  //jobs being processed
		concurrentLimit: 200,                       //number of workers
	}

	ctx, cancel := context.WithCancel(context.Background())

	var wg sync.WaitGroup

	wg.Add(streamCatcher.concurrentLimit)

	for i := 0; i < streamCatcher.concurrentLimit; i++ {
		go streamCatcher.startWork(&wg)
	}

	go streamCatcher.startQueues(ctx)

	sigCn := make(chan os.Signal)
	signal.Notify(sigCn, syscall.SIGINT, syscall.SIGTERM)

	<-sigCn
	fmt.Println("Shutting down")
	cancel()
	wg.Wait()

	fmt.Println("Done")

}
