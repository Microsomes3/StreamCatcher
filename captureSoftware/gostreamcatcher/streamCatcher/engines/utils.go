package engines

import (
	"sync"
)

type Engine interface {
	Download(EngineJob) (EngineResult, error)
	Run(w *sync.WaitGroup) bool
	PrintJob() string
}

type EngineJob struct {
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
