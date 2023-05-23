package engines

import "fmt"

type YTDlp struct {
	*EngineJob
}

func (en *YTDlp) Download(job EngineJob) (EngineResult, error) {
	en.EngineJob = &job
	return EngineResult{}, nil
}

func (en *YTDlp) Run() bool {
	return true
}

func (en *YTDlp) PrintJob() string {
	fmt.Println(en.JobID)
	fmt.Println(en.Link)
	fmt.Println(en.Timeout)
	return en.JobID
}
