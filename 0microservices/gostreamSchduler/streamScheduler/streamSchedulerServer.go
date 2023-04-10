package streamscheduler

import (
	"context"
	"net/http"
	"sync"

	"microsomes.com/streamscheduler/handlers"
)

type StreamSchedulerServer struct {
	server          http.Server
	StreamScheduler *StreamScheduler
}

func NewStreamSchedulerServer(lockIdleCheckServer *sync.Mutex) *StreamSchedulerServer {

	return &StreamSchedulerServer{
		server: http.Server{
			Addr: ":9007",
		},
		StreamScheduler: NewStreamScheduler(lockIdleCheckServer),
	}
}

func (s *StreamSchedulerServer) Start(wg *sync.WaitGroup, ctx context.Context) error {
	//if context killed stop server

	go s.StreamScheduler.StartAllWorkers(wg)

	go func() {
		<-ctx.Done()
		wg.Done()
		s.server.Shutdown(ctx)
	}()

	addJob := handlers.AddJob{
		AddJobrequestToQueue: s.StreamScheduler.ScheduleJob,
	}

	http.HandleFunc("/schedule", addJob.ServeHTTP)

	return s.server.ListenAndServe()
}
