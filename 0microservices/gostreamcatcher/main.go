package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/joho/godotenv"
	streamcatcher "microsomes.com/stgo/streamCatcher"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		fmt.Println("Error loading .env file")
	}

	fmt.Println(os.Getenv("ENV"))

	socketServer := streamcatcher.NewStreamCatcherSocketServer()

	ctx, cancelSocket := context.WithCancel(context.Background())

	go socketServer.StartSocketServer(ctx)

	server := streamcatcher.NewStreamCatcherServer(socketServer)

	ctx, cancel := context.WithCancel(context.Background())

	wg := &sync.WaitGroup{}

	wg.Add(1)
	go server.StartAndServe(wg, ctx)

	sigCn := make(chan os.Signal)
	signal.Notify(sigCn, syscall.SIGINT, syscall.SIGTERM)

	<-sigCn
	fmt.Println("Shutting down")
	cancel()
	cancelSocket()
	wg.Wait()

}
