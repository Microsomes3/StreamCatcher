package streamutil

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"microsomes.com/stgo/utils"
)

func ManageUploadOfPath(resultChan chan []string, paths []string, job utils.SteamJob) {
	fmt.Println("to upload:", len(paths))
	uploader := DLPUploader{}

	var toReturn []string = []string{}

	for index, path := range paths {
		f, err := os.Open("tmp/" + path)
		defer f.Close()

		if err != nil {
			fmt.Println("Error: ", err)
		}

		indexString := strconv.Itoa(index)

		fileUrl, _ := uploader.UploadFile(f, job.JobID+".mp4", indexString)

		fmt.Println("File uploaded: ", fileUrl)

		toReturn = append(toReturn, fileUrl)
	}

	resultChan <- toReturn

}

func ProcessDownload(sendUpdateProxy func(opts ...utils.StatusOptions), Job utils.SteamJob, progressUpdateCallback func(output string, done chan bool)) (utils.JobResponse, []string, error) {
	fmt.Println("Processing download for job: ", Job.JobID)
	fmt.Println("URL: ", Job.YoutubeLink)
	fmt.Println("Timeout: ", Job.TimeoutSeconds)

	doneDownloadCn := make(chan bool)
	downloadResultCn := make(chan utils.JobResponse)

	go func() {
		data, err := TryDownload(Job, "")

		if err != nil {
			fmt.Println("Error: ", err)
			doneDownloadCn <- true
			downloadResultCn <- utils.JobResponse{}
		}

		doneDownloadCn <- true
		downloadResultCn <- data

	}()

	<-doneDownloadCn

	data := <-downloadResultCn

	var allLinks []string

	fmt.Println("attempting to upload")

	sendUpdateProxy(utils.WithStatusCode("UPLOADING"), utils.WithStatusReason("Job is being uploaded"))

	time.Sleep(5 * time.Second)

	resultC := make(chan []string)

	go ManageUploadOfPath(resultC, data.Paths, utils.SteamJob{JobID: Job.JobID})

	allLinks = <-resultC

	return utils.JobResponse{}, allLinks, nil

}
