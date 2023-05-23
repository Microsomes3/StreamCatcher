package main

import (
	"context"
	"fmt"
	"os"
	"sync"

	streamcatcher "microsomes.com/stgo/streamCatcher"
	"microsomes.com/stgo/utils"
)

func StartSystem(streamCatcher *streamcatcher.StreamCatcher, workerWaitGroup *sync.WaitGroup) context.CancelFunc {
	queueCtx, cancelQueue := context.WithCancel(context.Background())

	go streamCatcher.StartAllWorkers(workerWaitGroup)
	go streamCatcher.StartQueues(queueCtx)

	return cancelQueue
}

func SystemCallback(systemWaitGroup *sync.WaitGroup, cancelQueue context.CancelFunc) func(job utils.SteamJob) {
	return func(job utils.SteamJob) {
		fmt.Println("callback:", job.JobID)
		os.Exit(0)
		cancelQueue()
		systemWaitGroup.Done()
	}
}

func main() {

	systemWaitGroup := sync.WaitGroup{}
	workerWaitGroup := sync.WaitGroup{}
	systemWaitGroup.Add(1)
	_, cancelQueue := context.WithCancel(context.Background())

	jobInfo := utils.GetJob()
	streamCatcher := streamcatcher.NewStreamCatcher(*jobInfo, nil, SystemCallback(&systemWaitGroup, cancelQueue))

	if jobInfo.ChannelName == "" {
		fmt.Println("Channel name could not be determined")
		streamCatcher.AddStatusEventV2(
			utils.WithStatusCode("ERR"),
			utils.WithStatusReason("Channel name could not be determined"),
		)
		os.Exit(0)
	}

	isLive, err := utils.GetLiveStatusv2(jobInfo.ChannelName, jobInfo.Provider)
	if err != nil {
		streamCatcher.AddStatusEventV2(
			utils.WithStatusCode("ERR"),
			utils.WithStatusReason("cannot determine if channel is live"),
		)
	}

	if isLive {
		streamCatcher.AddStatusEventV2(
			utils.WithStatusCode("PREPARING"),
			utils.WithStatusReason("Preparing to start recording"),
		)
	} else {
		streamCatcher.AddStatusEventV2(
			utils.WithStatusCode("ERR_OFFLINE"),
			utils.WithStatusReason("Channel is offline"),
		)
		os.Exit(0)
	}

	cancelQueue = StartSystem(streamCatcher, &workerWaitGroup)

	streamCatcher.AddJob(*jobInfo)

	systemWaitGroup.Wait()
	workerWaitGroup.Wait()

}
