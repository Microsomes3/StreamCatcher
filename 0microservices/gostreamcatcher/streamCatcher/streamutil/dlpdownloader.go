package streamutil

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
	"syscall"
	"time"

	"microsomes.com/stgo/utils"
)

func TryDownload(id string, url string, timeout int, mode string, wssocket string) (utils.JobResponse, error) {
	if id == "" {
		return utils.JobResponse{}, fmt.Errorf("id is empty")
	}

	newT := time.Duration(timeout) * time.Second
	fmt.Println("will timeout in:", newT)

	fmt.Println("trydownload", id)

	ytDlpArgs := []string{"--format", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4", url, "-o", "./tmp/" + id + "_%(title)s.%(ext)s"}
	if mode == "start" {
		ytDlpArgs = append([]string{"--live-from-start"}, ytDlpArgs...)
	}

	var child *exec.Cmd
	if mode == "start" {
		child = exec.Command("yt-dlp", ytDlpArgs...)
		fmt.Println("from start")
	} else {
		child = exec.Command("yt-dlp", ytDlpArgs...)
	}

	stdout, err := child.StdoutPipe()
	if err != nil {
		return utils.JobResponse{}, err
	}
	stderr, err := child.StderrPipe()
	if err != nil {
		return utils.JobResponse{}, err
	}

	if err := child.Start(); err != nil {
		return utils.JobResponse{}, err
	}

	go func() {
		defer stdout.Close()
		defer stderr.Close()

		buf := make([]byte, 1024)
		for {
			n, err := stdout.Read(buf)
			if err != nil {
				return
			}
			fmt.Printf("yt-dlp stdout: %s", buf[:n])
		}
	}()

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
		return utils.JobResponse{}, err
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
		if strings.Contains(file.Name(), ".mp4") {

			//check if filename starts with id
			if strings.HasPrefix(file.Name(), id) {
				mp4Files = append(mp4Files, file.Name())
			}
		}
	}

	// uploadAllTOS3(mp4Files)

	return utils.JobResponse{
		Status:   "success",
		Reason:   "",
		Paths:    mp4Files,
		Comments: []string{},
	}, nil
}
