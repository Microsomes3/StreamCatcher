package main

import (
	"fmt"
	"regexp"
)

func main() {
	str := "[download]   12.80MiB at    2.19KiB/s (00:02:07)  164/165"
	re := regexp.MustCompile(`[0-9]+/[0-9]+`)
	match := re.FindString(str)
	fmt.Println(match)

	if match != "" {
		fmt.Println("match found")
	} else {

		fmt.Println("match not found")
	}
}
