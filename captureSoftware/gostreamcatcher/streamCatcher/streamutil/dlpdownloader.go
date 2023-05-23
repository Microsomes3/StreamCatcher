package streamutil

import (
	"fmt"
	"os"
	"os/exec"
	"sort"
	"strings"
	"sync"
	"syscall"
	"time"

	"microsomes.com/stgo/streamCatcher/engines"
	"microsomes.com/stgo/utils"
)

type FileAndSize struct {
	FileName string
	FileSize int64
}

var totalProgressToReach int64 = 0
var currentProgress int64 = 0
var progressPercentage int64 = 0

var isAwaitingCompletion bool = false

func WaitTrigger(timeout time.Duration, done chan bool) {
	time.Sleep(timeout)
	fmt.Println("wait trigger")
	done <- true
}

func KillDownload(child *exec.Cmd, Job utils.SteamJob) {
	fmt.Println("Killing download")
	fmt.Println("current progress:", currentProgress)
	fmt.Println("total progress:", totalProgressToReach)

	if Job.IsStart {
		if Job.TryToCaptureAll == "yes" {
			if progressPercentage != 100 {
				//do not kill the process
				fmt.Println("do not kill the process")
				isAwaitingCompletion = true

				doneCn := make(chan bool, 1)

				go func(doneCn chan bool) {
					go WaitTrigger(time.Minute*30, doneCn)
				}(doneCn)
				<-doneCn

				fmt.Println("doneCn")

				child.Process.Signal(syscall.SIGINT)

			} else {
				child.Process.Signal(syscall.SIGINT)
			}
		} else {
			child.Process.Signal(syscall.SIGINT)
		}
	} else {
		child.Process.Signal(syscall.SIGINT)

	}

}

func AfterDownloadProcess() utils.JobResponse {
	// get .mp4 file
	files, err := os.ReadDir("./")
	if err != nil {
		return utils.JobResponse{}
	}
	mp4Files := []string{}
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		if strings.Contains(file.Name(), ".mp4") || strings.Contains(file.Name(), ".mkv") {
			mp4Files = append(mp4Files, file.Name())
		}
	}

	var filteredFiles []FileAndSize

	for _, fileName := range mp4Files {
		f, _ := os.Open("./" + fileName)
		fileInfo, _ := f.Stat()
		fileSize := fileInfo.Size()
		f.Close()
		filteredFiles = append(filteredFiles, FileAndSize{
			FileName: fileName,
			FileSize: fileSize,
		})
	}

	// sort largest to smallest
	sort.SliceStable(filteredFiles, func(i, j int) bool {
		return filteredFiles[i].FileSize > filteredFiles[j].FileSize
	})

	var pathString []string = []string{}

	for _, file := range filteredFiles {
		pathString = append(pathString, file.FileName)
	}

	return utils.JobResponse{
		Status:   "success",
		Reason:   "",
		Paths:    pathString,
		Comments: []string{},
	}
}

func TryDownload(Job utils.SteamJob, wssocket string) (utils.JobResponse, error) {

	fmt.Println("Processing download for job????: ", Job.JobID)

	if Job.JobID == "" {
		return utils.JobResponse{}, fmt.Errorf("id is empty")
	}

	var engineToUse engines.Engine = nil

	if Job.Engine == "yt-dlp" {
		engineToUse = engines.NewEngine(&engines.YTDlp{})
	} else {
		engineToUse = engines.NewEngine(&engines.YTEngine{})
	}

	engineToUse.Download(engines.EngineJob{
		JobID:   Job.JobID,
		Timeout: int64(Job.TimeoutSeconds),
		Link:    Job.YoutubeLink,
	})

	var wg sync.WaitGroup

	engineToUse.Run(&wg)

	wg.Wait()

	fmt.Println("engine done")

	return AfterDownloadProcess(), nil

}
