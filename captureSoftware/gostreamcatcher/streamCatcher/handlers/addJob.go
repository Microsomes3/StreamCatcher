package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"microsomes.com/stgo/utils"
)

type AddJob struct {
	Callback  func(jobDetails utils.SteamJob)
	ShouldAdd func(jobDetails utils.SteamJob) bool
}

func (a *AddJob) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	jobDetails := utils.SteamJob{}

	err = json.Unmarshal(body, &jobDetails)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	fmt.Println("Job: ", jobDetails.JobID)

	if !a.ShouldAdd(jobDetails) {
		w.Write([]byte("Job already exists"))
		return
	}

	a.Callback(jobDetails)

	w.Write([]byte("OK"))
}
