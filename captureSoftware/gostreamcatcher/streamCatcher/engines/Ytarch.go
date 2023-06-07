package engines

import (
	"fmt"
	"os/exec"
	"sync"
)

type YTEngine struct {
	*EngineJob
}

func (en *YTEngine) Download(job EngineJob) (EngineResult, error) {
	en.EngineJob = &job
	return EngineResult{}, nil
}

func (en *YTEngine) Run(wg *sync.WaitGroup) bool {
	wg.Add(1)
	defer wg.Done()

	var args []string = []string{
		en.Link,
		"-o",
		"tmp/%(channel)s/%(upload_date)s_%(title)s",
		en.Job.ResolutionRequested,
	}

	child := exec.Command("ytarchive", args...)

	fmt.Println("args:", args)

	watchDog := NewWatchDog(en.Timeout, child)

	doneCn := make(chan bool, 1)

	go watchDog.Start(&doneCn)

	<-doneCn

	fmt.Println("downloaded")

	return true
}

func (en *YTEngine) PrintJob() string {
	fmt.Println(en.JobID)
	fmt.Println(en.Link)
	fmt.Println(en.Timeout)
	return en.JobID
}
