package handlers

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"microsomes.com/stgo/utils"
)

type BulkAddJobs struct {
	Callback func(jobDetail utils.SteamJob)
}

type BulkRequest struct {
	Links      []string `json:"links"`
	UpdateHook string   `json:"updateHook"`
	Timeout    int      `json:"timeout"`
	IsStart    bool     `json:"isStart"`
	Groupid    string   `json:"groupid"`
}

func (c *BulkAddJobs) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	bulkRequest := BulkRequest{}

	err = json.Unmarshal(body, &bulkRequest)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var allJobIds []string = make([]string, 0)

	for _, link := range bulkRequest.Links {
		jobDetail := utils.SteamJob{
			JobID:          utils.GenerateJobID("bulk"),
			YoutubeLink:    link,
			TimeoutSeconds: bulkRequest.Timeout,
			IsStart:        bulkRequest.IsStart,
			UpdateHook:     bulkRequest.UpdateHook,
			Groupid:        bulkRequest.Groupid,
		}
		c.Callback(jobDetail)

		allJobIds = append(allJobIds, jobDetail.JobID)

	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(allJobIds)

}
