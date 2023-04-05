package main

import (
	"fmt"
	"time"
)

type SteamJob struct {
	JobID       string
	YoutubeLink string
	Timeout     int
	isStart     bool
}

type QueueJob struct {
	Job          SteamJob
	IsProcessing bool
	QueuedTime   int64
}

var QueueJobs []QueueJob

func (s *SteamJob) EnqueueJob() {
	QueueJobs = append(QueueJobs, QueueJob{
		Job:          *s,
		IsProcessing: false,
		QueuedTime:   time.Now().Unix(),
	})
	fmt.Println("Job has been queued")

}

func main() {
	st := SteamJob{
		JobID:       "123",
		YoutubeLink: "https://www.youtube.com/@ChillYourMind/live",
		Timeout:     30000,
		isStart:     false,
	}

	st.EnqueueJob()

	fmt.Println(QueueJobs)
}
