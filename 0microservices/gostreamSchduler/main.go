package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"microsomes.com/streamscheduler/streamscheduler"
)

func main() {
	server := streamscheduler.NewStreamSchedulerServer()

	ctx, cancel := context.WithCancel(context.Background())

	go server.Start(ctx)

	//wait for os signal
	sigCn := make(chan os.Signal, 1)
	signal.Notify(sigCn, syscall.SIGINT, syscall.SIGTERM)
	<-sigCn
	fmt.Println("os signal received, shutting down")
	cancel()
}
