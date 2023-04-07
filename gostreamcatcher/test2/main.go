package main

import (
	"context"
	"fmt"
	"math/rand"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

const workerPoolSize = 8

type Consumer struct {
	injestChan chan int
	jobsChan   chan int
}

func (c *Consumer) callbackFunc(event int) {
	c.injestChan <- event
}

func (c Consumer) workerFunc(wg *sync.WaitGroup, index int) {
	defer wg.Done()

	for eventIndex := range c.jobsChan {
		fmt.Printf("Worker %d started job %d\n", index, eventIndex)
		time.Sleep(time.Millisecond * time.Duration(1000+rand.Intn(2000)))
		fmt.Printf("Worker %d finished processing job %d\n", index, eventIndex)
	}

	fmt.Printf("Worker %d interrupted\n", index)

}

func (c Consumer) startConsumer(ctx context.Context) {
	for {
		select {
		case job := <-c.injestChan:
			c.jobsChan <- job
		case <-ctx.Done():
			fmt.Println("Consumer received cancellation signal, closing jobsChan!")
			close(c.jobsChan)
			fmt.Println("Consumer closed jobsChan")
			return
		}
	}
}

type Producer struct {
	callbackFunc func(event int)
}

func (p Producer) start() {
	eventIndex := 0
	for {
		p.callbackFunc(eventIndex)
		eventIndex++
		time.Sleep(time.Millisecond * 100)
	}
}

func main() {

	consumer := Consumer{
		injestChan: make(chan int, 1000),
		jobsChan:   make(chan int, workerPoolSize),
	}

	producer := Producer{
		callbackFunc: consumer.callbackFunc,
	}

	go producer.start()

	ctx, cancelFunc := context.WithCancel(context.Background())
	wg := sync.WaitGroup{}

	go consumer.startConsumer(ctx)

	wg.Add(workerPoolSize)

	for i := 0; i < workerPoolSize; i++ {
		go consumer.workerFunc(&wg, i)
	}

	termChan := make(chan os.Signal)
	signal.Notify(termChan, syscall.SIGINT, syscall.SIGTERM)

	<-termChan

	fmt.Println("Received termination signal, cancelling context")
	cancelFunc()
	wg.Wait()

	fmt.Println("All workers finished, exiting")

}
