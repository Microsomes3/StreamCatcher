package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"sync"
	"time"
)

type ConversionRequest struct {
	File   string `json:"path"`
	Format string `json:"format"`
	Id     string `json:"id"`
}

type ConversionResponse struct {
	Success     bool     `json:"success"`
	OutputFiles []string `json:"outputFile"`
}

type Status struct {
	State   string    `json:"state"`
	Created time.Time `json:"created"`
	Updated time.Time `json:"updated"`
}

type AllStatusResponse struct {
	Statusses        map[string]Status `json:"statusses"`
	TotalProgressing int               `json:"totalProgressing"`
	TotalSuccess     int               `json:"totalSuccess"`
}

var (
	jobQueue   = make(chan ConversionRequest, 200) // A buffered channel to act as a queue
	workerPool = 5                                 // Number of workers in the pool
)

var al = make(map[string]Status)

func convertToFormat(id string, format string) error {
	fmt.Println("converting to format: " + format)

	files, _ := os.ReadDir(id)

	for _, f := range files {
		al[id] = Status{State: "processing", Created: time.Now(), Updated: time.Now()}

		cmd := exec.Command("ffmpeg", "-i", id+"/"+f.Name(), "-f", format, id+"/"+f.Name()+"."+format)
		err := cmd.Run()

		if err != nil {
			fmt.Println(err.Error())
			al[id] = Status{State: "error", Created: time.Now(), Updated: time.Now()}
		}

		return err
	}

	return nil
}

func download(req ConversionRequest) (ConversionResponse, error) {
	if req.File == "all2.mp3" {
		time.Sleep(300 * time.Second)
	}

	al[req.Id] = Status{State: "processing", Created: time.Now(), Updated: time.Now()}

	//create a folder
	os.Mkdir(req.Id, 0777)

	outputFile := req.Id + "_output.%(ext)s"

	cmd := exec.Command("yt-dlp", "-o", req.Id+"/"+outputFile, req.File)
	err := cmd.Run()

	if err != nil {
		fmt.Println(err.Error())
		al[req.Id] = Status{State: "error", Created: time.Now(), Updated: time.Now()}

		return ConversionResponse{Success: false, OutputFiles: []string{}}, err
	}

	al[req.Id] = Status{State: "converting", Created: time.Now(), Updated: time.Now()}

	err = convertToFormat(req.Id, req.Format)

	if err != nil {
		fmt.Println(err.Error())
		al[req.Id] = Status{State: "error_converting", Created: time.Now(), Updated: time.Now()}
	}

	al[req.Id] = Status{State: "success", Created: time.Now(), Updated: time.Now()}

	return ConversionResponse{Success: true, OutputFiles: []string{
		outputFile,
	}}, nil
}

func worker(jobQueue <-chan ConversionRequest) {
	for req := range jobQueue {
		func() {
			// Recover from any panics and log the error
			defer func() {
				if r := recover(); r != nil {
					log.Printf("Recovered from panic in worker: %v", r)
				}
			}()

			resp, err := download(req)
			if err != nil {
				log.Printf("Error processing job: %v", err)
			} else {
				log.Printf("Job processed: %+v", resp)
			}
		}()
	}
}

func createWorker(jobQueue <-chan ConversionRequest, wg *sync.WaitGroup) {
	for {
		wg.Add(1)
		go func() {
			defer wg.Done()
			worker(jobQueue)
		}()
		time.Sleep(time.Second) // Add a delay before restarting a worker, if needed
	}
}

func processJobs() {
	var wg sync.WaitGroup

	for i := 0; i < workerPool; i++ {
		go createWorker(jobQueue, &wg)
	}

	wg.Wait()
}

func handleJobRequest(w http.ResponseWriter, r *http.Request) {
	var req ConversionRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	req.Id = fmt.Sprintf("%d", time.Now().UnixNano())

	al[req.Id] = Status{State: "created", Created: time.Now(), Updated: time.Now()}

	select {
	case jobQueue <- req:
		w.WriteHeader(http.StatusAccepted)
		w.Write([]byte(req.Id))
	default:
		http.Error(w, "Job queue is full", http.StatusServiceUnavailable)
	}
}

func main() {
	go processJobs()

	http.HandleFunc("/job", handleJobRequest)

	http.HandleFunc("/statuses", func(w http.ResponseWriter, r *http.Request) {
		var tp = 0
		var ts = 0

		for _, v := range al {
			if v.State == "processing" {
				tp++
			}

			if v.State == "success" {
				ts++
			}
		}

		tr := AllStatusResponse{
			Statusses:        al,
			TotalProgressing: tp,
			TotalSuccess:     ts,
		}

		json.NewEncoder(w).Encode(tr)
	})

	http.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		id := r.URL.Query().Get("id")

		//serve folder
		//all files
		files, err := os.ReadDir(id)

		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var files2 []string

		for _, f := range files {
			files2 = append(files2, f.Name())
		}

		json.NewEncoder(w).Encode(files2)
	})

	log.Fatal(http.ListenAndServe(":8082", nil))
}
