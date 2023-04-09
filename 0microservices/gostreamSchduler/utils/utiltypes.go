package utils

type JobRequest struct {
	ID         string `json:"id"`
	YoutubeURL string `json:"youtube_url"`
	Timeout    int    `json:"timeout"`
	IsStart    bool   `json:"is_start"`
	UpdateHook string `json:"update_hook"`
}
