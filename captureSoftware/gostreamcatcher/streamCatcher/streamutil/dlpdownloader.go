package streamutil

import (
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"syscall"
	"time"

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

func TrackProgress(output string, done chan bool, child *exec.Cmd, Job utils.SteamJob) {
	re := regexp.MustCompile(`[0-9]+/[0-9]+`)
	match := re.FindString(string(output))
	if match != "" {

		progress := strings.Split(match, "/")

		fmt.Println("[>>", progress[0], "--", progress[1], "]")

		totalProgressToReach, _ = strconv.ParseInt(progress[1], 10, 64)
		currentProgress, _ = strconv.ParseInt(progress[0], 10, 64)

		if currentProgress == 0 {
			// progressPercentage = 0
		} else if totalProgressToReach == 0 {
			// progressPercentage = 0
		} else {
			progressPercentage = (currentProgress / totalProgressToReach) * 100
			fmt.Println("-------")
			fmt.Println(">", currentProgress)
			fmt.Println(">", totalProgressToReach)

			if isAwaitingCompletion {
				if progressPercentage == 100 {
					KillDownload(child, Job)
				}
			}

			fmt.Println("progress:", progressPercentage)
		}

		// progressPercentage := (currentProgress / totalProgressToReach) * 100

		// if isAwaitingCompletion {
		// 	if progressPercentage == 100 {
		// 		KillDownload(nil, utils.SteamJob{})
		// 	}
		// }

	}
}

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

func getDownloadArgsYt(Job utils.SteamJob, mode string) []string {
	var toReturn = []string{Job.YoutubeLink, "-o", "./tmp/" + "%(title)s.%(ext)s"}

	if mode == "start" {
		toReturn = append([]string{"-k"}, toReturn...)
		toReturn = append([]string{"--live-from-start"}, toReturn...)
	}

	return toReturn
}

func startCommand(Job utils.SteamJob, mode string, args []string) *exec.Cmd {

	var toReturn *exec.Cmd = nil

	if Job.Engine == "yt-dlp" {
		if mode == "start" {
			toReturn = exec.Command(Job.Engine, args...)
			fmt.Println("from start")
		} else {
			toReturn = exec.Command(Job.Engine, args...)
		}
	} else {
		toReturn = exec.Command(Job.Engine, args...)
	}

	return toReturn
}

func TryDownload(Job utils.SteamJob, wssocket string) (utils.JobResponse, error) {

	var mode string = ""

	if Job.IsStart {
		mode = "start"
	} else {
		mode = "current"
	}

	fmt.Println("ll")
	if Job.JobID == "" {
		return utils.JobResponse{}, fmt.Errorf("id is empty")
	}

	newT := time.Duration(Job.TimeoutSeconds) * time.Second
	fmt.Println("will timeout in:", newT)

	fmt.Println("trydownload", Job.JobID)

	var downloadArgs []string = []string{}

	if Job.Engine == "yt-dlp" {
		downloadArgs = getDownloadArgsYt(Job, mode)
	} else {
		downloadArgs = []string{Job.Engine, "https://www.youtube.com/@CreepsMcPasta/live", "1080p/best"}
	}

	var child *exec.Cmd = startCommand(Job, mode, downloadArgs)

	// stderr, err := child.StderrPipe()
	strData, err := child.StdoutPipe()
	if err != nil {
		fmt.Println("error 1")
		return utils.JobResponse{}, err
	}

	if err := child.Start(); err != nil {
		fmt.Println("error 2")
		return utils.JobResponse{}, err
	}

	go func() {
		defer strData.Close()

		buf := make([]byte, 1024)

		for {
			n, err := strData.Read(buf)
			if err != nil {
				return
			}

			if mode == "start" {
				TrackProgress(string(buf[:n]), nil, child, Job)
			}

			if strings.Contains(string(buf[:n]), "Merger") {
				if mode == "start" {
					fmt.Println("killing yt-dlp since we dont need auto merging")
					KillDownload(child, Job)
				}
			}
		}

	}()

	backupTimer := time.AfterFunc(newT, func() {
		fmt.Println("Sending SIGINT signal")
		KillDownload(child, Job)
	})

	if err := child.Wait(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			if status, ok := exitErr.Sys().(syscall.WaitStatus); ok {
				if status.ExitStatus() == int(syscall.SIGINT) {
					// SIGINT signal sent by backupTimer
					fmt.Println("yt-dlp process was terminated by the timeout")
				}
			}
		}
		fmt.Println("error 3")
	}

	backupTimer.Stop()

	// get .mp4 file
	files, err := os.ReadDir("./tmp")
	if err != nil {
		return utils.JobResponse{}, err
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
		f, _ := os.Open("./tmp/" + fileName)
		fileInfo, _ := f.Stat()
		fileSize := fileInfo.Size()
		f.Close()
		filteredFiles = append(filteredFiles, FileAndSize{
			FileName: fileName,
			FileSize: fileSize,
		})
	}

	fmt.Println("==>>>>", filteredFiles)
	//sort largest to smallest
	sort.SliceStable(filteredFiles, func(i, j int) bool {
		return filteredFiles[i].FileSize > filteredFiles[j].FileSize
	})

	var pathString []string = []string{}

	for _, file := range filteredFiles {
		pathString = append(pathString, file.FileName)
	}

	fmt.Println("==>>>>", filteredFiles)

	return utils.JobResponse{
		Status:   "success",
		Reason:   "",
		Paths:    pathString,
		Comments: []string{},
	}, nil
}

func HandleCleanUpAndFinishUp() {}
