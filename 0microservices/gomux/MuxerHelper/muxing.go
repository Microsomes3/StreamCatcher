package muxerhelper

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

type MuxResult struct {
	OutputFile string  `json:"output_file"`
	Status     string  `json:"status"`
	R2File     string  `json:"r2_file"`
	Size       int64   `json:"size"`
	Duration   float32 `json:"duration"`
}

type GoMuxJob struct {
	JobID      string `json:"jobId"`
	ReqID      string `json:"reqId"`
	AudioLink  string `json:"audio_link"`
	VideoLink  string `json:"video_link"`
	UpdateHook string `json:"update_hook"`
	Type       string `json:"type"`
}

type GoMuxStatus struct {
	State  string    `json:"state"`
	Result MuxResult `json:"result"`
	Time   int64     `json:"time"`
}

func GetVideoDuration(videoUrl string) (float32, error) {
	var outb, errb bytes.Buffer
	cmd := exec.Command("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", videoUrl)
	cmd.Stdout = &outb
	cmd.Stderr = &errb

	err := cmd.Run()
	if err != nil {
		return 0, err
	}

	duration := outb.String()
	duration = strings.TrimRight(duration, "\n")

	f, err := strconv.ParseFloat(duration, 64)
	if err != nil {
		panic(err)
	}
	result := float32(f)
	fmt.Printf("%f\n", result)

	return result, nil
}

func PerformMuxingJob(jobId string, videoUrl string, audioUrl string, status string) (MuxResult, error) {
	fmt.Println("Muxing video and audio")

	var outb, errb bytes.Buffer
	cmd := exec.Command("ffmpeg", "-i", videoUrl, "-i", audioUrl, "-c", "copy", "muxed.mp4")
	cmd.Stdout = &outb
	cmd.Stderr = &errb

	doneCn := make(chan bool)

	err := cmd.Start()
	if err != nil {
		return MuxResult{}, err
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

	cmd.Wait()

	doneCn <- true

	fmt.Println("\nMuxing complete.")

	muxedFile, err := os.Open("muxed.mp4")
	if err != nil {
		return MuxResult{}, err
	}

	defer muxedFile.Close()

	fileInfo, err := muxedFile.Stat()

	if err != nil {
		panic(err)
		return MuxResult{}, err
	}

	fileSize := fileInfo.Size()

	fmt.Printf("Muxed file size: %d bytes\n", fileSize)

	muxedFileDuration, _ := GetVideoDuration("muxed.mp4")

	fmt.Printf("Muxed file duration: %f\n", muxedFileDuration)

	uploader := DLPUploader{}

	uploadUrl, err := uploader.UploadFile(muxedFile, "muxxed_"+jobId+".mp4", "0")
	if err != nil {
		return MuxResult{}, err
	}

	fmt.Printf("Uploaded muxed file to %s\n", uploadUrl)

	return MuxResult{
		OutputFile: "muxed.mp4",
		Status:     "done",
		R2File:     uploadUrl,
		Size:       fileSize,
		Duration:   muxedFileDuration,
	}, nil
}
