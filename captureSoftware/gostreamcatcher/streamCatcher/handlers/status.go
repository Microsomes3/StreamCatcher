package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"microsomes.com/stgo/utils"
)

type JobStatus struct {
	GetStatusesByJobID    func(id string) utils.JobStatus
	GetAllStatusesByJobID func(id string) []utils.JobStatus
}

type JobStatusResponse struct {
	Current utils.JobStatus   `json:"current"`
	Events  []utils.JobStatus `json:"events"`
}

func (j *JobStatus) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	jobID := r.URL.Query().Get("jobid")

	fmt.Println("JobID: ", jobID)

	if jobID == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	currentStatus := j.GetStatusesByJobID(jobID)
	allStatuses := j.GetAllStatusesByJobID(jobID)

	status1 := JobStatusResponse{Current: currentStatus, Events: allStatuses}

	if currentStatus.State == "" {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(status1)
}
