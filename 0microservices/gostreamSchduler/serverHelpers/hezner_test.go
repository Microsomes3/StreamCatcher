package serverhelpers

import (
	"fmt"
	"testing"
)

func TestHezner_CreateServer(t *testing.T) {
	h := &Hezner{}

	_, err := h.CreateServer()

	if err != nil {
		t.Error(err)
	}

	fmt.Println("TestHezner_CreateServer passed")
}

func Test_ListServers(t *testing.T) {
	h := &Hezner{}

	err := h.ListServers()

	if err != nil {
		t.Error(err)
	}

	fmt.Println("TestHezner_ListServers passed")
}
