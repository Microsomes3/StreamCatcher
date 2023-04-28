package handlers

import "net/http"

type Drain struct {
	Callback func()
}

func (d *Drain) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	d.Callback()

	w.Write([]byte("OK"))
}
