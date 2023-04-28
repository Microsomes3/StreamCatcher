package handlers

import "net/http"

type Files struct {
}

func (f *Files) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	http.FileServer(http.Dir("tmp")).ServeHTTP(w, r)
}
