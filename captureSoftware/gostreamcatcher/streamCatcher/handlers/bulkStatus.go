package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"microsomes.com/stgo/utils"
)

type BulkStatuses struct {
	GetStatusesByJobID func(id string) utils.JobStatus
}

type BulkStatusesResponse struct {
	AskedFOR []string                   `json:"askedfor"`
	Statuses map[string]utils.JobStatus `json:"statuses"`
}

type BulkStatusRequest struct {
	JobIDs []string `json:"jobids"`
}

func (b *BulkStatuses) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	bulkStatusRequest := BulkStatusRequest{}

	err := json.NewDecoder(r.Body).Decode(&bulkStatusRequest)

	fmt.Println("JobIDs: ", bulkStatusRequest.JobIDs)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	statuses := make(map[string]utils.JobStatus)

	for _, jobID := range bulkStatusRequest.JobIDs {
		statuses[jobID] = b.GetStatusesByJobID(jobID)
	}

	status1 := BulkStatusesResponse{Statuses: statuses, AskedFOR: bulkStatusRequest.JobIDs}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(status1)
}
