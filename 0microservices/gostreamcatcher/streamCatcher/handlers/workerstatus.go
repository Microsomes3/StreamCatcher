package handlers

import (
	"encoding/json"
	"net/http"

	"microsomes.com/stgo/utils"
)

type WorkerStatus struct {
	GetWorkerStatus func() utils.WorkerStatus
}

func (ws *WorkerStatus) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	workerStatus := ws.GetWorkerStatus()

	byte, err := json.Marshal(workerStatus)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	w.Write(byte)

}
