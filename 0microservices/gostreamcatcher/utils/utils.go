package utils

import "encore.dev/types/uuid"

type SteamJob struct {
	JobID          string `json:"jobId"`
	ReqID          string `json:"reqId"`
	YoutubeLink    string `json:"youtubeLink"`
	Provider       string `json:"provider"`
	TimeoutSeconds int    `json:"timeout"`
	IsStart        bool   `json:"isStart"`
	UpdateHook     string `json:"updateHook"`
	Groupid        string `json:"groupid"`
	ChannelName    string `json:"channelName"`
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
