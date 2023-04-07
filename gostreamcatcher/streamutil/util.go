package streamutil

type SteamJob struct {
	JobID          string `json:"jobId"`
	YoutubeLink    string `json:"youtubeLink"`
	TimeoutSeconds int    `json:"timeout"`
	IsStart        bool   `json:"isStart"`
}

type QueueJob struct {
	Job          SteamJob
	IsProcessing bool
	QueuedTime   int64
}
