package engines

import (
	"fmt"
	"os/exec"
	"sync"

	"microsomes.com/stgo/utils"
)

type YTDlp struct {
	*EngineJob
}

func (en *YTDlp) Download(job EngineJob) (EngineResult, error) {
	en.EngineJob = &job
	return EngineResult{}, nil
}

func (en *YTDlp) Run(wg *sync.WaitGroup) bool {
	wg.Add(1)
	defer wg.Done()

	job := utils.GetJob()

	var args []string = []string{job.YoutubeLink, "-o", "./" + "%(title)s.%(ext)s"}

	if job.IsStart {
		args = append([]string{"-k"}, args...)
		args = append([]string{"--live-from-start"}, args...)
	}

	child := exec.Command("yt-dlp", args...)

	watchDog := NewWatchDog(en.Timeout, child)

	doneCn := make(chan bool, 1)

	go watchDog.Start(&doneCn)

	<-doneCn

	fmt.Println("downloaded")

	return true
}

func (en *YTDlp) PrintJob() string {
	fmt.Println(en.JobID)
	fmt.Println(en.Link)
	fmt.Println(en.Timeout)
	return en.JobID
}
