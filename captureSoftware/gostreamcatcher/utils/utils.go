package utils

import (
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"

	"encore.dev/types/uuid"
)

type ReasonToSend struct {
	Reason           string `json:"reason"`
	IsTimeoutTrigger bool   `json:"isTimeoutTrigger"`
	IsEndStream      bool   `json:"isEndStream"`
}

type SteamJob struct {
	JobID               string `json:"jobId"`
	ReqID               string `json:"reqId"`
	YoutubeLink         string `json:"youtubeLink"`
	Provider            string `json:"provider"`
	TimeoutSeconds      int    `json:"timeout"`
	IsStart             bool   `json:"isStart"`
	UpdateHook          string `json:"updateHook"`
	Groupid             string `json:"groupid"`
	ChannelName         string `json:"channelName"`
	ShouldUpload        string `json:"shouldUpload"`
	TryToCaptureAll     string `json:"tryToCaptureAll"`
	Engine              string `json:"engine"` //yt-dlp or ytarchive
	ResolutionRequested string `json:"resolutionRequested"`
}

type FileStatus struct {
	Name    string `json:"name"`
	Size    int64  `json:"size"`
	RunTime int64  `json:"runTime"`
}

type JobStatusV2 struct {
	JobDetails   SteamJob
	DateTime     int64
	StatusCode   string
	StatusReason string
	Result       []string
	AllFiles     []FileStatus
}

type StatusOptions func(*JobStatusV2)

var ACCEPTABLEStatusCodes []string = []string{
	"ERR",
	"ERR_OFFLINE",
	"PREPARING",
	"QUEUED",
	"RECORDING",
	"UPLOADING",
	"DONE",
}

func WithStatusCode(code string) StatusOptions {

	var shouldUse bool = false

	for _, v := range ACCEPTABLEStatusCodes {
		if v == code {
			shouldUse = true
			break
		}
	}

	return func(j *JobStatusV2) {
		if shouldUse {
			j.StatusCode = code
		} else {
			fmt.Println("warning: invalid status code: ", code)
		}
	}
}

func WithStatusReason(reason string) StatusOptions {
	return func(j *JobStatusV2) {
		j.StatusReason = reason
	}
}

func WithResult(result []string) StatusOptions {
	return func(j *JobStatusV2) {
		j.Result = result
	}
}

type JobStatus struct {
	State  string   `json:"state"`
	Result []string `json:"result"`
	Time   int64    `json:"time"`
}

type JobStatusEvents []JobStatus

type JobResponse struct {
	Status   string   `json:"status"`
	Reason   string   `json:"reason"`
	Paths    []string `json:"paths"`
	Comments []string `json:"comments"`
}

type WorkerStatus struct {
	TotalQueue     int `json:"totalQueue"`
	TotalRecording int `json:"totalRecording"`
	TotalDone      int `json:"totalDone"`
	TotalDuration  int `json:"totalDuration"`
}

type JobEvent struct {
	Status JobStatus `json:"status"`
	Job    SteamJob  `json:"job"`
}

func GenerateJobID(tag string) string {

	uid, _ := uuid.NewV4()

	return tag + "_" + uid.String()
}

func GetChannelNameFromUrl(job *SteamJob, url string, provider string) string {
	var username string
	if provider == "youtube" {

		re := regexp.MustCompile(`@(\w+)`)
		match := re.FindStringSubmatch(url)
		if len(match) > 1 {
			username = "@" + match[1]
			job.ChannelName = username
		} else {
			fmt.Println("No match found")
		}
	} else {
		re := regexp.MustCompile(`https://www.twitch.tv/(\w+)/live`)
		match := re.FindStringSubmatch(url)

		// The first submatch contains the username
		fmt.Println(match[1])
		username = match[1]

		job.ChannelName = username

	}

	return username
}

func GetJob() *SteamJob {
	fmt.Println("ecs adapater module...")
	jobid := os.Getenv("jobid")
	reqid := os.Getenv("reqid")
	url := os.Getenv("url")
	timeout := os.Getenv("timeout")
	isstart := os.Getenv("isstart")
	updatehook := os.Getenv("updatehook")
	provider := os.Getenv("provider")
	shouldUpload := os.Getenv("shouldUpload")

	tryCaptureAll := os.Getenv("tryToCaptureAll")

	res := os.Getenv("res")

	if res == "" {
		res = "720p/best"
	}

	if tryCaptureAll == "" {
		tryCaptureAll = "no"
	}

	if provider == "" {
		provider = "youtube" //
	}

	if shouldUpload == "" {
		shouldUpload = "yes"
	}

	var isS bool = false

	if isstart == "true" {
		isS = true
	} else {
		isS = false
	}

	timeoutInt, _ := strconv.ParseInt(timeout, 10, 64)

	var engine string = ""

	if os.Getenv("engine") != "" {
		engine = os.Getenv("engine")
	} else {
		engine = "yt-dlp"
	}

	job := SteamJob{
		JobID:               jobid,
		ReqID:               reqid,
		TimeoutSeconds:      int(timeoutInt),
		YoutubeLink:         url,
		IsStart:             isS,
		UpdateHook:          updatehook,
		Provider:            provider,
		ShouldUpload:        shouldUpload,
		TryToCaptureAll:     tryCaptureAll,
		Engine:              engine,
		ResolutionRequested: res,
	}

	job.ChannelName = GetChannelNameFromUrl(&job, job.YoutubeLink, job.Provider)

	fmt.Println("job:", job)

	return &job

}

func GetLiveStatusv2(username string, provider string) (bool, error) {
	var formattedUrl = ""

	if provider == "twitch" {
		formattedUrl = "https://twitch.tv/" + username + "/live"
	} else if provider == "youtube" {
		formattedUrl = "https://youtube.com/" + username + "/live"
	} else if provider == "facebook" {
		formattedUrl = "https://facebook.com/" + username + "/live"
	} else if provider == "instagram" {
		formattedUrl = "https://instagram.com/" + username + "/live"
	} else if provider == "twitter" {
		formattedUrl = "https://twitter.com/" + username + "/live"
	} else if provider == "mixer" {
		formattedUrl = "https://mixer.com/" + username + "/live"
	}

	cmd := exec.Command("yt-dlp", "-f", "bestvideo[height<=?1080][vcodec^=avc1]+bestaudio/best", "-g", formattedUrl)

	err := cmd.Start()
	if err != nil {
		return false, err
	}

	err = cmd.Wait()
	if err != nil {
		if strings.Contains(err.Error(), "exit status 1") {
			return false, nil
		} else {
			return false, err
		}
	}

	return true, nil
}
