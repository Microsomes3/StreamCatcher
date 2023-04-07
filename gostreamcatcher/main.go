package main

import (
	"bytes"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"
	"time"

	"microsomes.com/gostreamcatcher/streamutil"
)

var (
	jobToProcessQueue = make(chan SteamJob, 200) // A buffered channel to act as a queue
	workers           = 8
	totalRecording    = 0
	muTotalRecording  = sync.Mutex{}
)

type JobStatus struct {
	State  string   `json:"state"`
	Result []string `json:"result"`
}

var jobStatuses = make(map[string]JobStatus)
var jobStatusLock = sync.RWMutex{}

func QueueWork(job SteamJob) {

	muTotalRecording.Lock()
	totalRecording++
	muTotalRecording.Unlock()

	jobStatusLock.Lock()
	jobStatuses[job.JobID] = JobStatus{
		State:  "queued",
		Result: []string{},
	}
	jobStatusLock.Unlock()

	postUpdateToHook(job, jobStatuses[job.JobID])

	jobToProcessQueue <- job
}

func worker(job <-chan SteamJob) {
	for {
		select {
		case j := <-job:
			time.Sleep(2 * time.Second)

			fmt.Println("Processed job: ", j.JobID)
			fmt.Println(j)

			jobStatusLock.Lock()
			jobStatuses[j.JobID] = JobStatus{
				State:  "recording",
				Result: []string{},
			}
			jobStatusLock.Unlock()
			go postUpdateToHook(j, jobStatuses[j.JobID])
			data, err := streamutil.ProcessDownload(j.YoutubeLink, j.TimeoutSeconds, j.JobID, j.IsStart)

			if err != nil {
				fmt.Println("Error: ", err)
				jobStatuses[j.JobID] = JobStatus{
					State:  "error",
					Result: []string{},
				}
			} else {
				fmt.Println("Files: ", data)
				jobStatuses[j.JobID] = JobStatus{
					State:  "success",
					Result: data.Paths,
				}

			}

			postUpdateToHook(j, jobStatuses[j.JobID])

			muTotalRecording.Lock()
			totalRecording--
			muTotalRecording.Unlock()

		default:
			// fmt.Println("No jobs to process:", time.Now().Format("2006-01-02 15:04:05"))
			time.Sleep(1 * time.Second)

		}
	}
}

func startWorkers(wg *sync.WaitGroup) {
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			worker(jobToProcessQueue)
		}()
	}
}

type SteamJob struct {
	JobID          string `json:"jobId"`
	YoutubeLink    string `json:"youtubeLink"`
	TimeoutSeconds int    `json:"timeout"`
	IsStart        bool   `json:"isStart"`
	UpdateHook     string `json:"updateHook"`
}

func uuivv4() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return ""
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

type PostUpdateInfo struct {
	JobID  string    `json:"jobId"`
	Status JobStatus `json:"status"`
}

func postUpdateToHook(job SteamJob, status JobStatus) {
	fmt.Println("Posting update to hook: ", job.UpdateHook)

	// Create an HTTP client with a timeout
	httpClient := &http.Client{
		Timeout: time.Second * 5, // Set timeout to 30 seconds
	}

	toPostStatus := &PostUpdateInfo{
		JobID:  job.JobID,
		Status: status,
	}

	// Create a request
	jsonData, err := json.Marshal(toPostStatus)
	if err != nil {
		fmt.Println("Error: ", err)
		return
	}

	req, err := http.NewRequest("POST", job.UpdateHook, bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error: ", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	// Send the request and handle the response
	resp, err := httpClient.Do(req)
	if err != nil {
		fmt.Println("Error sending request: ", err)
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response: ", err)
		return
	}

	// Check for non-200 status code
	if resp.StatusCode != http.StatusOK {
		fmt.Println("Error: non-200 status code received: ", resp.StatusCode)
		return
	}

	fmt.Println("Response: ", string(body))
}

type StatusResponse struct {
	TotalProcessing int `json:"totalProcessing"`
}

func main() {

	doneCn := make(chan bool)

	var wg = sync.WaitGroup{}

	go startWorkers(&wg)

	ws := http.FileServer(http.Dir("./tmp"))

	http.Handle("/", ws)

	http.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		//show total processing

		toResponse := StatusResponse{
			TotalProcessing: totalRecording,
		}

		jsonData, err := json.Marshal(toResponse)

		if err != nil {
			fmt.Println("Error: ", err)
			http.Error(w, "Error", http.StatusInternalServerError)
			return
		}

		w.Write(jsonData)

	})

	http.HandleFunc("/schedulegriffin", func(w http.ResponseWriter, r *http.Request) {

		randomId := uuivv4()

		job := SteamJob{
			JobID:          randomId,
			YoutubeLink:    "https://www.youtube.com/@GriffinGaming/live",
			TimeoutSeconds: 43200,
			IsStart:        true,
			UpdateHook:     "https://1bd1-77-102-234-41.eu.ngrok.io",
		}

		QueueWork(job)

		w.Write([]byte(randomId))

	})

	http.HandleFunc("/die", func(w http.ResponseWriter, r *http.Request) {
		doneCn <- true
	})

	http.HandleFunc("/job", func(w http.ResponseWriter, r *http.Request) {
		//only post
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		body, err := ioutil.ReadAll(r.Body)

		if err != nil {
			http.Error(w, "Error reading body", http.StatusInternalServerError)
		}

		fmt.Println("Body: ", string(body))

		//convert to json
		var job SteamJob

		json.Unmarshal(body, &job)

		fmt.Println("Job: ", job)

		//if job exists in the status map, return the status

		if _, ok := jobStatuses[job.JobID]; ok {
			fmt.Println("Job exists in status map")
			fmt.Println(jobStatuses[job.JobID])

			toReturn, _ := json.Marshal(jobStatuses[job.JobID])

			w.Write([]byte(toReturn))
			return
		}

		QueueWork(job)

		// w.WriteHeader(http.StatusOK)

		w.Write([]byte("OK"))
	})

	//listen on port 9005

	go func() {
		http.ListenAndServe(":9005", nil)
	}()

	select {
	case <-doneCn:
	}

}
