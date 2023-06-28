package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"sync"
)

type Job struct {
	CommentVideoUrl string
	VideoUrl        string
}

func getJob() *Job {

	j := &Job{}

	j.CommentVideoUrl = os.Getenv("COMMENT_VIDEO_URL")
	j.VideoUrl = os.Getenv("VIDEO_URL")

	return j

}

func DownloadFile(fileName string, link string, w *sync.WaitGroup) bool {
	defer w.Done()
	resp, err := http.Get(link)

	if err != nil {
		return false
	}

	defer resp.Body.Close()

	out, err := os.Create(fileName)

	if err != nil {
		return false
	}

	defer out.Close()

	_, err = io.Copy(out, resp.Body)

	if err != nil {
		return false
	}

	return true

}

func (j *Job) DownloadVideos() {
	//download videos to perform overlay processing

	//download comment video

	syn := sync.WaitGroup{}
	syn.Add(2)
	go DownloadFile("comment.mp4", j.CommentVideoUrl, &syn)
	go DownloadFile("video.mp4", j.VideoUrl, &syn)

	syn.Wait()

	fmt.Println("Downloaded videos")
}

func (j *Job) CropCommentVideo() bool {
	//ffmpeg -i input.mp4 -filter:v "crop=600:400:0:0" -c:a copy out.mp4

	c := exec.Command("ffmpeg", "-i", "comment.mp4", "-filter:v", "crop=600:400:0:0", "-c:a", "copy", "comment_cropped.mp4")

	err := c.Run()

	if err != nil {
		return false
	}

	return true

}

func (j *Job) PerformProcessing() {
	//ffmpeg -i video.mp4 -i overlay.mp4 -filter_complex "[1]format=rgba,colorchannelmixer=aa=0.5[ovrl];[0][ovrl]overlay=x=(W-w)+20:y=100" output.mp4

	c := exec.Command("ffmpeg", "-i", "video.mp4", "-i", "comment_cropped.mp4", "-filter_complex", "[1]format=rgba,colorchannelmixer=aa=0.5[ovrl];[0][ovrl]overlay=x=(W-w)+20:y=100", "output.mp4")

	err := c.Run()

	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println("Processing done")

}

func (*Job) UploadVideo() {

	o, err := os.Open("output.mp4")

	if err != nil {
		fmt.Println(err)
		return
	}

	defer o.Close()

	uploader := &DLPUploader{}

	p, err := uploader.UploadFile(o, "ex_output.mp4", "1")

	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(p)

}

func main() {
	job := getJob()

	fmt.Println("downloading video")
	job.DownloadVideos()
	fmt.Println("downloaded video")

	fmt.Println("cropping comment video")
	job.CropCommentVideo()
	fmt.Println("cropped comment video")

	fmt.Println("performing processing")
	job.PerformProcessing()
	fmt.Println("processing done")

	fmt.Println("uploading video")
	job.UploadVideo()
	fmt.Println("uploaded video")

}
