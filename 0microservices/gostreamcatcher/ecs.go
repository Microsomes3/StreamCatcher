package main

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"sync"
	"time"

	streamcatcher "microsomes.com/stgo/streamCatcher"
	"microsomes.com/stgo/utils"
)

func main() {
	fmt.Println("ecs adapater module")
	jobid := os.Getenv("jobid")
	reqid := os.Getenv("reqid")
	url := os.Getenv("url")
	timeout := os.Getenv("timeout")
	isstart := os.Getenv("isstart")
	updatehook := os.Getenv("updatehook")

	fmt.Println("jobid: ", jobid)
	fmt.Println("url: ", url)
	fmt.Println("timeout: ", timeout)
	fmt.Println("isstart: ", isstart)
	fmt.Println("updatehook: ", updatehook)
	fmt.Println("reqid: ", reqid)

	queueCtx, cancelQueue := context.WithCancel(context.Background())

	callback := func(job utils.SteamJob) {
		fmt.Println("callback:", job.JobID)
		os.Exit(0)
		cancelQueue()
	}

	streamCatcher := streamcatcher.NewStreamCatcher(nil, callback)

	fmt.Println("streamCatcher: ", streamCatcher)

	wg := sync.WaitGroup{}
	go streamCatcher.StartAllWorkers(&wg)
	go streamCatcher.StartQueues(queueCtx)

	var isS bool = false

	if isstart == "true" {
		isS = true
	} else {
		isS = false
	}

	timeoutInt, _ := strconv.ParseInt(timeout, 10, 64)

	fmt.Println("timeoutInt: ", timeoutInt)
	fmt.Println("isS: ", isS)
	streamCatcher.AddJob(utils.SteamJob{
		JobID:          jobid,
		ReqID:          reqid,
		TimeoutSeconds: int(timeoutInt),
		YoutubeLink:    url,
		IsStart:        isS,
		UpdateHook:     updatehook,
	})

	wg.Wait()

	//int(timeoutInt) sleep
	time.Sleep(time.Duration(timeoutInt) * time.Second)
	time.Sleep(time.Duration(timeoutInt) * time.Second)

}
