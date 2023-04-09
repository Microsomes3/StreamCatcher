package utils

type JobRequest struct {
	YoutubeURL string `json:"youtube_url"`
	Timeout    int    `json:"timeout"`
	IsStart    bool   `json:"is_start"`
}
