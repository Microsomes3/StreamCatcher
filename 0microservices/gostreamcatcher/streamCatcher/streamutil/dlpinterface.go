package streamutil

import (
	"fmt"

	"microsomes.com/stgo/utils"
)

func ProcessDownload(url string, timeout int, jobid string, isStart bool) (utils.JobResponse, error) {
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
		return utils.JobResponse{}, err
	}

	return data, nil

}
