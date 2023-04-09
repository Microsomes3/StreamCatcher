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
