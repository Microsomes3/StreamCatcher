package handlers

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"microsomes.com/streamscheduler/utils"
)

type AddJob struct {
	AddJobrequestToQueue func(job utils.JobRequest) error
}

func (a *AddJob) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	//check if not post
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte("Method not allowed"))
		return
	}

	var job utils.JobRequest

	bytes, err := ioutil.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error reading request body"))
		return
	}

	err = json.Unmarshal(bytes, &job)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error parsing request body"))
		return
	}

	generateJobId, err := utils.GenerateId()

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error generating job id"))
		return
	}

	job.ID = generateJobId

	err = a.AddJobrequestToQueue(job)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error adding job to queue, queue is full"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Job created: " + generateJobId))

}
