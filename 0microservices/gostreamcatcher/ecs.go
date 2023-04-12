package main

import (
	"context"
	"fmt"
	"os"
	"regexp"
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
	provider := os.Getenv("provider")
	shouldUpload := os.Getenv("shouldUpload")

	if provider == "" {
		provider = "youtube" //
	}

	fmt.Println("jobid: ", jobid)
	fmt.Println("url: ", url)
	fmt.Println("timeout: ", timeout)
	fmt.Println("isstart: ", isstart)
	fmt.Println("updatehook: ", updatehook)
	fmt.Println("reqid: ", reqid)

	if shouldUpload == "" {
		shouldUpload = "yes"
	}

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

	job := utils.SteamJob{
		JobID:          jobid,
		ReqID:          reqid,
		TimeoutSeconds: int(timeoutInt),
		YoutubeLink:    url,
		IsStart:        isS,
		UpdateHook:     updatehook,
		Provider:       provider,
		ShouldUpload:   shouldUpload,
	}

	var username string = ""

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

	if username == "" {
		streamCatcher.AddStatusEvent(&job, "error", []string{"username not found"})

		os.Exit(0)
	}

	isLive, err := streamcatcher.GetLiveStatusv2(username, provider)
	if err != nil {
		fmt.Println("error: ", err)
	}

	if !isLive {
		fmt.Println("not live")

		streamCatcher.AddStatusEvent(&job, "error", []string{"not live"})

		os.Exit(0)
	}

	streamCatcher.AddJob(job)

	wg.Wait()

	//int(timeoutInt) sleep
	time.Sleep(time.Duration(timeoutInt) * time.Second)
	time.Sleep(time.Duration(timeoutInt) * time.Second)

}
