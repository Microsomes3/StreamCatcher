package utils

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

type WorkerStatus struct {
	TotalQueue     int `json:"totalQueue"`
	TotalRecording int `json:"totalRecording"`
	TotalDone      int `json:"totalDone"`
	TotalDuration  int `json:"totalDuration"`
}

func SignalWorkerToDie(publicIp string) error {
	//
	httpClient := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := httpClient.Post("http://"+publicIp+":9005/drain", "application/json", nil)

	if err != nil {
		return err
	}

	defer resp.Body.Close()

	bytes, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		return err
	}

	fmt.Println("response from server", string(bytes))

	return nil

}

func GetServerWorkerStatus(publicIp string) (WorkerStatus, error) {
	httpClient := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := httpClient.Get("http://" + publicIp + ":9005/workerStatus")

	if err != nil {
		fmt.Println("error getting worker status", err)
		return WorkerStatus{}, err
	}

	defer resp.Body.Close()

	bytes, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		fmt.Println("error reading body", err)
		return WorkerStatus{}, err
	}

	var workerStatus WorkerStatus

	err = json.Unmarshal(bytes, &workerStatus)

	if err != nil {
		fmt.Println("error unmarshalling", err)
		return WorkerStatus{}, err
	}

	return workerStatus, nil
}
