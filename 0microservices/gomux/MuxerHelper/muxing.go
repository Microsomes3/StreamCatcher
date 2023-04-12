package muxerhelper

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"time"
)

type MuxResult struct {
	OutputFile string
	Status     string
}

func PerformMuxingJob(videoUrl string, audioUrl string, status string) (*MuxResult, error) {
	fmt.Println("Muxing video and audio")

	var outb, errb bytes.Buffer
	cmd := exec.Command("ffmpeg", "-i", videoUrl, "-i", audioUrl, "-c", "copy", "muxed.mp4")
	cmd.Stdout = &outb
	cmd.Stderr = &errb

	doneCn := make(chan bool)

	err := cmd.Start()
	if err != nil {
		return nil, err
	}

	go func() {
		for {
			select {
			case <-time.After(1 * time.Second):
				fileInfo, err := os.Stat("muxed.mp4")
				if err == nil {
					progress := int(fileInfo.Size() * 100 / (1024 * 1024))
					fmt.Printf("\rProgress: %d%%", progress)
				}
			case <-doneCn:
				return
			}
		}
	}()

	err = cmd.Wait()
	if err != nil {
		return nil, err
	}

	doneCn <- true

	fmt.Println("\nMuxing complete.")

	return &MuxResult{
		OutputFile: "muxed.mp4",
		Status:     "done",
	}, nil
}
