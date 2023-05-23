package engines

import (
	"fmt"
	"os"
	"os/exec"
	"sync"
	"time"
)

type WatchDog struct {
	Duration int64
	Spawned  *exec.Cmd
}

func NewWatchDog(duration int64, child *exec.Cmd) *WatchDog {
	return &WatchDog{
		Duration: duration,
		Spawned:  child,
	}
}

func (w *WatchDog) KillDownload() bool {
	err := w.Spawned.Process.Kill()
	if err != nil {
		fmt.Println("error killing process")
		return false
	}
	return true
}

func (w *WatchDog) EndDownloadFriendly() bool {
	err := w.Spawned.Process.Signal(os.Interrupt)

	if err != nil {
		fmt.Println("error killing process")
		return false
	}

	return true
}

func (w *WatchDog) StartDownload(wg *sync.WaitGroup) bool {
	if err := w.Spawned.Start(); err != nil {
		fmt.Println("error starting process")
		return false
	}

	err := w.Spawned.Wait()

	if err != nil {
		panic(err)
	}

	wg.Done()

	return true
}

func (w *WatchDog) MonitorDownload() bool {
	time.Sleep(time.Second * time.Duration(w.Duration))

	doesKill := w.EndDownloadFriendly()
	if doesKill {
		fmt.Println("killed process")
	}

	return true
}

func (w *WatchDog) Start(doneCn *chan bool) {
	fmt.Println("watchdog started")
	fmt.Println(w.Spawned)

	var wg sync.WaitGroup
	wg.Add(1)
	go w.MonitorDownload()
	go w.StartDownload(&wg)

	wg.Wait()

	fmt.Println("watchdog done")
	*doneCn <- true
}
