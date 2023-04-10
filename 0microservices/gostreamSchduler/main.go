package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"sync"
	"syscall"

	serverkiller "microsomes.com/streamscheduler/serverKiller"
	streamscheduler "microsomes.com/streamscheduler/streamScheduler"
)

func main() {

	lockIdleCheckServer := &sync.Mutex{}

	serverKiller := serverkiller.NewServerKiller(lockIdleCheckServer)

	go serverKiller.Work()
	doneServerKiller := make(chan bool)
	go serverKiller.Tick(doneServerKiller)

	server := streamscheduler.NewStreamSchedulerServer(lockIdleCheckServer)

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
	doneServerKiller <- true
}
