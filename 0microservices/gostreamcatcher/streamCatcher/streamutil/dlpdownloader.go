package streamutil

import (
	"fmt"
	"os"
	"os/exec"
	"sort"
	"strings"
	"syscall"
	"time"

	"microsomes.com/stgo/utils"
)

type FileAndSize struct {
	FileName string
	FileSize int64
}

func TryDownload(id string, url string, timeout int, mode string, wssocket string) (utils.JobResponse, error) {
	fmt.Println("ll")
	if id == "" {
		return utils.JobResponse{}, fmt.Errorf("id is empty")
	}

	newT := time.Duration(timeout) * time.Second
	fmt.Println("will timeout in:", newT)

	fmt.Println("trydownload", id)

	ytDlpArgs := []string{url, "-o", "./tmp/" + "%(title)s.%(ext)s"}

	if mode == "start" {
		ytDlpArgs = append([]string{"-k"}, ytDlpArgs...)
		ytDlpArgs = append([]string{"--live-from-start"}, ytDlpArgs...)
	}

	fmt.Println("====", ytDlpArgs)

	var child *exec.Cmd
	if mode == "start" {
		child = exec.Command("yt-dlp", ytDlpArgs...)
		fmt.Println("from start")
	} else {
		child = exec.Command("yt-dlp", ytDlpArgs...)
	}

	stderr, err := child.StderrPipe()
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
		defer stderr.Close()

		buf := make([]byte, 1024)
		for {
			n, err := stderr.Read(buf)
			if err != nil {
				return
			}
			fmt.Printf("yt-dlp stderr: %s", buf[:n])
		}
	}()

	go func() {
		defer strData.Close()

		buf := make([]byte, 1024)

		for {
			n, err := strData.Read(buf)
			if err != nil {
				return
			}

			if strings.Contains(string(buf[:n]), "Merger") {
				if mode == "start" {
					fmt.Println("killing yt-dlp since we dont need auto merging")
					child.Process.Signal(syscall.SIGKILL)
				}
			}

			fmt.Printf("yt-dlp stdout: %s", buf[:n])
		}

	}()

	backupTimer := time.AfterFunc(newT, func() {
		fmt.Println("Sending SIGINT signal")
		child.Process.Signal(syscall.SIGINT)
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
