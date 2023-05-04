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

	return &job

}

func main() {

	jobToUse := getJob()

	fmt.Println("jobToUse: ", jobToUse)

	queueCtx, cancelQueue := context.WithCancel(context.Background())

	wgl := sync.WaitGroup{}

	wgl.Add(1)

	callback := func(job utils.SteamJob) {
		fmt.Println("callback:", job.JobID)
		os.Exit(0)
		cancelQueue()
		wgl.Done()
	}

	streamCatcher := streamcatcher.NewStreamCatcher(nil, callback)

	fmt.Println("streamCatcher: ", streamCatcher)

	wg := sync.WaitGroup{}
	go streamCatcher.StartAllWorkers(&wg)
	go streamCatcher.StartQueues(queueCtx)

	username := getChannelNameFromUrl(jobToUse, jobToUse.YoutubeLink, jobToUse.Provider)

	if username == "" {
		streamCatcher.AddStatusEvent(jobToUse, "error", []string{"username not found"})
		os.Exit(0)
	}

	isLive, err := streamcatcher.GetLiveStatusv2(username, jobToUse.Provider)
	if err != nil {
		fmt.Println("error: ", err)
	}

	if !isLive {
		fmt.Println("not live")

		streamCatcher.AddStatusEvent(jobToUse, "was_not_live", []string{"user is not live"})

		os.Exit(0)
	}

	//griffin start beta v2 request
	if jobToUse.ReqID == "e3d035ac-fbe2-49e3-812e-327c6fb5f342" {
		jobToUse.TryToCaptureAll = "yes"
	}

	streamCatcher.AddJob(*jobToUse)

	wg.Wait()

	wgl.Wait()
}
