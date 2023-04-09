package streamscheduler

import (
	"context"
	"net/http"
)

type StreamSchedulerServer struct {
	server          http.Server
	StreamScheduler *StreamScheduler
}

func NewStreamSchedulerServer() *StreamSchedulerServer {
	return &StreamSchedulerServer{
		server: http.Server{
			Addr: ":9005",
		},
		StreamScheduler: NewStreamScheduler(),
	}
}

func (s *StreamSchedulerServer) Start(ctx context.Context) error {
	//if context killed stop server
	go func() {
		<-ctx.Done()
		s.server.Shutdown(ctx)
	}()

	return s.server.ListenAndServe()
}
