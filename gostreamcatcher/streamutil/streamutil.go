package streamutil

import (
	"fmt"
	"os"
	"syscall"
	"time"
)

// terminateProcess sends a SIGINT signal to a process and waits for it to exit. If the process is still running
// after a specified timeout, it sends a SIGKILL signal and waits again for it to exit.
func terminateProcess(process *os.Process, timeout time.Duration) error {
	// send SIGINT signal to the process and wait for it to exit
	if err := process.Signal(syscall.SIGINT); err != nil {
		return err
	}
	if _, err := process.Wait(); err == nil {
		// process exited successfully
		return nil
	}

	// process did not exit within the timeout, send SIGKILL signal and wait again
	if err := process.Signal(syscall.SIGKILL); err != nil {
		return err
	}
	if _, err := process.Wait(); err == nil {
		// process exited successfully
		return nil
	}

	// process did not exit even after sending SIGKILL signal
	return fmt.Errorf("process did not exit within %s and was killed", timeout)
}

func ProcessDownload(url string, timeout int, jobid string, isStart bool) (JobResponse, error) {
	fmt.Println("Processing download for job: ", jobid)
	fmt.Println("URL: ", url)
	fmt.Println("Timeout: ", timeout)

	var mode string = "--"

	if isStart {
		mode = "start"
	} else {
		mode = "current"
	}

	data, err := TryDownload(jobid, url, timeout, mode, "")

	if err != nil {
		fmt.Println("Error: ", err)
		return JobResponse{}, err
	}

	return data, nil

}
