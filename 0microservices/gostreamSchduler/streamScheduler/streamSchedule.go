package streamscheduler

import (
	"errors"
	"fmt"
	"sync"

	"microsomes.com/streamscheduler/utils"
)

type StreamScheduler struct {
	totalWorkers    int
	toScheduleQueue chan utils.JobRequest
	workerQueue     chan chan utils.JobRequest
}

func NewStreamScheduler() *StreamScheduler {
	return &StreamScheduler{
		totalWorkers:    10,
		toScheduleQueue: make(chan utils.JobRequest, 5),
		workerQueue:     make(chan chan utils.JobRequest, 100),
	}
}

func (s *StreamScheduler) ScheduleJob(job utils.JobRequest) error {
	//try adding to jobRequest if full return error
	select {
	case s.toScheduleQueue <- job:
		fmt.Println("job added to queue")
		return nil
	default:
		return errors.New("job queue is full")
	}
}

func (s *StreamScheduler) worker(wg *sync.WaitGroup) {
	defer wg.Done()
	for job := range s.toScheduleQueue {
		fmt.Println("processing", job)

		AssignJobToServer(job) //tasked with assigning job to server, if provision a server, if not assign to existing server

		fmt.Println("job done")
	}

	fmt.Println("interrupted. Shutting down")
}

func (s *StreamScheduler) StartAllWorkers(diewg *sync.WaitGroup) {
	var wg sync.WaitGroup
	for i := 0; i < s.totalWorkers; i++ {
		wg.Add(1)
		go s.worker(&wg)
	}

	wg.Wait()
	diewg.Done()
	fmt.Println("all workers stopped")
}
