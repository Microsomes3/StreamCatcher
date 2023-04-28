package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strings"
	"time"
)

type ReplayService struct {
	AllComments *Comments
}

func (r *ReplayService) FirstComment() Comment {
	return (*r.AllComments)[0]
}

func (r *ReplayService) LastComment() Comment {
	return (*r.AllComments)[len(*r.AllComments)-1]
}

func (r *ReplayService) AllTimes() []string {
	//first time
	ftime := r.FirstComment().Timestamp //3:26am
	ltime := r.LastComment().Timestamp  // 9:36 am

	//we need all minutes between 3:26am and 9:36pm

	//parse

	//ftime remove spaces
	ftime = strings.Trim(ftime, " ")

	fmt.Println("old>>", ftime)
	newFtime := FixTimeFormat(ftime)

	fmt.Println(newFtime)
	t, err := time.Parse("3:04AM", newFtime)
	if err != nil {
		panic(err)
	}

	fmt.Println(t)

	var mins []string = []string{
		ftime,
		ltime,
	}
	// Iterate through each minute between the first and last timestamps
	// for currTime := ftime; currTime.Before(ltime); currTime = currTime.Add(time.Minute) {
	// 	mins = append(mins, currTime.Format("15:04"))
	// }

	return mins
}

type Comment struct {
	Author    string `json:"author"`
	Comment   string `json:"comment"`
	Image     string `json:"image"`
	Timestamp string `json:"timestamp"`
}

type Comments []Comment

func FixTimeFormat(stringTime string) string {

	fmt.Println("given", stringTime)

	mode := ""
	var f1 = ""

	if strings.Contains(stringTime, "AM") {
		mode = "am"
		f1 = strings.Split(stringTime, "AM")[0]

	} else {
		mode = "pm"
		f1 = strings.Split(stringTime, "PM")[0]

	}

	fmt.Println(mode, f1)

	//remove spaces
	f1 = strings.Trim(f1, " ")

	var R = f1 + mode

	//remove spaces
	R = strings.Trim(R, " ")

	fmt.Println(">>", R)

	tp, _ := time.Parse("3:26 AM", R)

	fmt.Println(">>", tp)

	return R
}

func main() {

	fmt.Println("Hello World")

	f, err := ioutil.ReadFile("comments.json")

	if err != nil {
		panic(err)
	}

	comments := Comments{}

	err = json.Unmarshal(f, &comments)

	fmt.Println(len(comments))

	r := ReplayService{&comments}

	fmt.Println(r)

	fmt.Println(r.FirstComment())
	fmt.Println(r.LastComment())
	fmt.Println(r.AllTimes())

}
