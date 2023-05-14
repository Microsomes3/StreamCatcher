package utils

import (
	"fmt"

	"encore.dev/types/uuid"
)

type ReasonToSend struct {
	Reason           string `json:"reason"`
	IsTimeoutTrigger bool   `json:"isTimeoutTrigger"`
	IsEndStream      bool   `json:"isEndStream"`
}

type SteamJob struct {
	JobID           string `json:"jobId"`
	ReqID           string `json:"reqId"`
	YoutubeLink     string `json:"youtubeLink"`
	Provider        string `json:"provider"`
	TimeoutSeconds  int    `json:"timeout"`
	IsStart         bool   `json:"isStart"`
	UpdateHook      string `json:"updateHook"`
	Groupid         string `json:"groupid"`
	ChannelName     string `json:"channelName"`
	ShouldUpload    string `json:"shouldUpload"`
	TryToCaptureAll string `json:"tryToCaptureAll"`
}

type FileStatus struct {
	Name    string `json:"name"`
	Size    int64  `json:"size"`
	RunTime int64  `json:"runTime"`
}

type JobStatusV2 struct {
	JobDetails   SteamJob
	DateTime     int64
	StatusCode   string
	StatusReason string
	Result       []string
	AllFiles     []FileStatus
}

type StatusOptions func(*JobStatusV2)

var ACCEPTABLEStatusCodes []string = []string{
	"ERR",
	"ERR_OFFLINE",
	"PREPARING",
	"QUEUED",
	"RECORDING",
	"UPLOADING",
	"DONE",
}

func WithStatusCode(code string) StatusOptions {

	var shouldUse bool = false

	for _, v := range ACCEPTABLEStatusCodes {
		if v == code {
			shouldUse = true
			break
		}
	}

	return func(j *JobStatusV2) {
		if shouldUse {
			j.StatusCode = code
		} else {
			fmt.Println("warning: invalid status code: ", code)
		}
	}
}

func WithStatusReason(reason string) StatusOptions {
	return func(j *JobStatusV2) {
		j.StatusReason = reason
	}
}

func WithResult(result []string) StatusOptions {
	return func(j *JobStatusV2) {
		j.Result = result
	}
}

type JobStatus struct {
	State  string   `json:"state"`
	Result []string `json:"result"`
	Time   int64    `json:"time"`
}

type JobStatusEvents []JobStatus

type JobResponse struct {
	Status   string   `json:"status"`
	Reason   string   `json:"reason"`
	Paths    []string `json:"paths"`
	Comments []string `json:"comments"`
}

type WorkerStatus struct {
	TotalQueue     int `json:"totalQueue"`
	TotalRecording int `json:"totalRecording"`
	TotalDone      int `json:"totalDone"`
	TotalDuration  int `json:"totalDuration"`
}

type JobEvent struct {
	Status JobStatus `json:"status"`
	Job    SteamJob  `json:"job"`
}

func GenerateJobID(tag string) string {

	uid, _ := uuid.NewV4()

	return tag + "_" + uid.String()
}
