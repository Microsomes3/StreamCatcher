package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"sync"
	"syscall"

	streamscheduler "microsomes.com/streamscheduler/streamScheduler"
)

func main() {

	server := streamscheduler.NewStreamSchedulerServer()

	ctx, cancel := context.WithCancel(context.Background())

	wg := &sync.WaitGroup{}
	go server.Start(wg, ctx)

	//wait for os signal
	sigCn := make(chan os.Signal, 1)
	signal.Notify(sigCn, syscall.SIGINT, syscall.SIGTERM)
	<-sigCn
	fmt.Println("os signal received, shutting down")
	cancel()
	wg.Wait()
}
