package main

import (
	"fmt"
	"os"
	"os/exec"
	"time"
)

func main() {
	//ytarchive https://www.youtube.com/@CreepsMcPasta/live 1080p/best

	child := exec.Command("ytarchive", "-o", "tmp/%(channel)s/%(upload_date)s_%(title)s", "https://www.youtube.com/@CreepsMcPasta/live", "1080p/best")

	if err := child.Start(); err != nil {
		panic(err)
	}

	time.Sleep(10 * time.Second)

	fmt.Println("killing")
	child.Process.Signal(os.Interrupt)

	time.Sleep(10 * time.Second)

}
