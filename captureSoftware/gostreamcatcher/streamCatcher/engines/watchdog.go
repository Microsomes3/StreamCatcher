package engines

import (
	"fmt"
	"os"
	"os/exec"
	"sync"
	"time"

	"microsomes.com/stgo/utils"
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
		fmt.Println("error killing process  mm")
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
		panic(err)
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

func (w *WatchDog) KeepTrackOfTimeout(stopCn chan bool, wg *sync.WaitGroup) {
	var elaspedSeconds int64 = 0

	var isTriggered bool = false

	for {
		select {
		case <-stopCn:
			fmt.Println("stopCn")
			return
		default:
			time.Sleep(time.Second)

			elaspedSeconds += 1

			if elaspedSeconds >= w.Duration {
				if !isTriggered {
					fmt.Println("triggered")
					doesKill := w.EndDownloadFriendly()
					if doesKill {
						fmt.Println("killed process")
						isTriggered = true
						wg.Done()
					} else {
						fmt.Println("failed to kill process")
					}
				}

				return
			}

			fmt.Println("checking", elaspedSeconds, w.Duration)
		}
	}
}
func (w *WatchDog) KeepTrackOfOnlineStatus(stopCn chan bool, wg *sync.WaitGroup) {

	ticker := time.NewTicker(time.Minute * 1)
	defer ticker.Stop()
	for {
		select {
		case <-stopCn:
			return
		case <-ticker.C:

			job := utils.GetJob()

			isOnline, _ := utils.GetLiveStatusv2(job.ChannelName, job.Provider)

			if !isOnline {
				fmt.Println("channel is offline")
				doesKill := w.EndDownloadFriendly()
				if doesKill {
					fmt.Println("killed process")
					wg.Done()
				}
				return
			} else {
				fmt.Println("channel is online")
			}

		}
	}

}

func (w *WatchDog) MonitorDownload() bool {

	wg := sync.WaitGroup{}
	wg.Add(1)

	doneC := make(chan bool, 1)

	go w.KeepTrackOfTimeout(doneC, &wg)
	go w.KeepTrackOfOnlineStatus(doneC, &wg)

	wg.Wait()
	fmt.Println("doneC")
	close(doneC)

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
