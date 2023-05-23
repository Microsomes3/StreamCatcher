package engines

import (
	"sync"

	"microsomes.com/stgo/utils"
)

type Engine interface {
	Download(EngineJob) (EngineResult, error)
	Run(w *sync.WaitGroup) bool
	PrintJob() string
}

type EngineJob struct {
	Job     utils.SteamJob
	JobID   string
	Timeout int64
	Link    string
}

type EngineResult struct {
	Files      []string
	ResultName string
	ExtraInfo  interface{}
}

func NewEngine(toReturn Engine) Engine {
	return toReturn
}
