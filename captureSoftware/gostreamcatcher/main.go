package main

import (
	"context"
	"fmt"
	"os"
	"regexp"
	"strconv"
	"sync"

	streamcatcher "microsomes.com/stgo/streamCatcher"
	"microsomes.com/stgo/utils"
)

func getChannelNameFromUrl(job *utils.SteamJob, url string, provider string) string {
	var username string
	if provider == "youtube" {

		re := regexp.MustCompile(`@(\w+)`)
		match := re.FindStringSubmatch(url)
		if len(match) > 1 {
			username = "@" + match[1]
			job.ChannelName = username
		} else {
			fmt.Println("No match found")
		}
	} else {
		re := regexp.MustCompile(`https://www.twitch.tv/(\w+)/live`)
		match := re.FindStringSubmatch(url)

		// The first submatch contains the username
		fmt.Println(match[1])
		username = match[1]

		job.ChannelName = username

	}

	return username
}

func getJob() *utils.SteamJob {
	fmt.Println("ecs adapater module...")
	jobid := os.Getenv("jobid")
	reqid := os.Getenv("reqid")
	url := os.Getenv("url")
	timeout := os.Getenv("timeout")
	isstart := os.Getenv("isstart")
	updatehook := os.Getenv("updatehook")
	provider := os.Getenv("provider")
	shouldUpload := os.Getenv("shouldUpload")

	tryCaptureAll := os.Getenv("tryToCaptureAll")

	if tryCaptureAll == "" {
		tryCaptureAll = "no"
	}

	if provider == "" {
		provider = "youtube" //
	}

	fmt.Println("jobid: ", jobid)
	fmt.Println("url: ", url)
	fmt.Println("timeout: ", timeout)
	fmt.Println("isstart: ", isstart)
	fmt.Println("updatehook: ", updatehook)
	fmt.Println("reqid: ", reqid)
	fmt.Println("capture all:", tryCaptureAll)

	if shouldUpload == "" {
		shouldUpload = "yes"
	}

	var isS bool = false

	if isstart == "true" {
		isS = true
	} else {
		isS = false
	}

	timeoutInt, _ := strconv.ParseInt(timeout, 10, 64)

	job := utils.SteamJob{
		JobID:           jobid,
		ReqID:           reqid,
		TimeoutSeconds:  int(timeoutInt),
		YoutubeLink:     url,
		IsStart:         isS,
		UpdateHook:      updatehook,
		Provider:        provider,
		ShouldUpload:    shouldUpload,
		TryToCaptureAll: tryCaptureAll,
	}

	job.ChannelName = getChannelNameFromUrl(&job, job.YoutubeLink, job.Provider)

	return &job

}

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

	jobInfo := getJob()
	streamCatcher := streamcatcher.NewStreamCatcher(*jobInfo, nil, SystemCallback(&systemWaitGroup, cancelQueue))

	if jobInfo.ChannelName == "" {
		fmt.Println("Channel name could not be determined")
		streamCatcher.AddStatusEventV2(
			utils.WithStatusCode("ERR"),
			utils.WithStatusReason("Channel name could not be determined"),
		)
		os.Exit(0)
	}

	isLive, err := streamcatcher.GetLiveStatusv2(jobInfo.ChannelName, jobInfo.Provider)
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
