package main

import (
	"fmt"
	"strings"
)

func main() {

	var files []string = []string{
		"What's Up GAMERS...Xbox's Biggest L! Redfall is Only 30FPS on Xbox Series X. Fanboys are in DENIAL.f140.mp4",
		"What's Up GAMERS...Xbox's Biggest L! Redfall is Only 30FPS on Xbox Series X. Fanboys are in DENIAL.f299.mp4",
		"What's Up GAMERS...Xbox's Biggest L! Redfall is Only 30FPS on Xbox Series X. Fanboys are in DENIAL.mp4",
	}

	var filteredFiles []string

	for _, file := range files {
		if strings.Count(file, ".") == 3 {
			filteredFiles = append(filteredFiles, file)
		}
	}

	fmt.Println(filteredFiles)

}
