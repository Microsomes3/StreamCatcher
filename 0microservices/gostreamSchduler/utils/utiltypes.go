package utils

type JobRequest struct {
	ID         string `json:"id"`
	YoutubeURL string `json:"youtube_url"`
	Timeout    int    `json:"timeout"`
	IsStart    bool   `json:"is_start"`
	UpdateHook string `json:"update_hook"`
}

type Server struct {
	Provider string `json:"provider"`
	Name     string `json:"name"`
	ID       int    `json:"id"`
	PublicIP string `json:"public_ip"`
}

type SteamJob struct {
	JobID          string `json:"jobId"`
	YoutubeLink    string `json:"youtubeLink"`
	TimeoutSeconds int    `json:"timeout"`
	IsStart        bool   `json:"isStart"`
	UpdateHook     string `json:"updateHook"`
	Groupid        string `json:"groupid"`
}

type JobStatus struct {
	State  string   `json:"state"`
	Result []string `json:"result"`
	Time   int64    `json:"time"`
}

type ToSendStatusHook struct {
	Job    SteamJob
	Status JobStatus
}
