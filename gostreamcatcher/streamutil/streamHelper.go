package streamutil

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"syscall"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

type JobResponse struct {
	Status   string   `json:"status"`
	Reason   string   `json:"reason"`
	Paths    []string `json:"paths"`
	Comments []string `json:"comments"`
}

func uploadAllTOS3(paths []string) error {
	// Initialize a new AWS session with default configuration
	sess, err := session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Region: aws.String("us-east-1"), // Replace with the desired AWS region
		},
		SharedConfigState: session.SharedConfigEnable,
	})
	if err != nil {
		return fmt.Errorf("failed to initialize AWS session: %v", err)
	}

	// Create an S3 client
	svc := s3.New(sess)

	// Upload each file to the S3 bucket
	for _, path := range paths {
		// Open the file
		file, err := os.Open(path)
		if err != nil {
			return fmt.Errorf("failed to open file %s: %v", path, err)
		}
		defer file.Close()

		// Get the file size and read the contents into a byte slice
		fileInfo, _ := file.Stat()
		size := fileInfo.Size()
		buffer := make([]byte, size)
		_, err = file.Read(buffer)
		if err != nil {
			return fmt.Errorf("failed to read file %s: %v", path, err)
		}

		// Upload the file to S3
		_, err = svc.PutObject(&s3.PutObjectInput{
			Bucket: aws.String("griffin-record-input"), // Replace with the desired S3 bucket name
			Key:    aws.String(fileInfo.Name()),
			Body:   bytes.NewReader(buffer),
		})
		if err != nil {
			return fmt.Errorf("failed to upload file %s to S3: %v", path, err)
		}

		fmt.Printf("Uploaded file %s to S3\n", path)
	}

	return nil
}
func TryDownload(id string, url string, timeout int, mode string, wssocket string) (JobResponse, error) {
	if id == "" {
		return JobResponse{}, fmt.Errorf("id is empty")
	}

	newT := time.Duration(timeout) * time.Second
	fmt.Println("will timeout in:", newT)

	fmt.Println("trydownload", id)

	ytDlpArgs := []string{"--format", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4", url, "-o", "tmp/" + id + "_%(title)s.%(ext)s"}
	if mode == "start" {
		ytDlpArgs = append([]string{"--live-from-start"}, ytDlpArgs...)
	}

	var child *exec.Cmd
	if mode == "start" {
		child = exec.Command("yt-dlp", ytDlpArgs...)
		fmt.Println("from start")
	} else {
		child = exec.Command("yt-dlp", ytDlpArgs...)
	}

	stdout, err := child.StdoutPipe()
	if err != nil {
		return JobResponse{}, err
	}
	stderr, err := child.StderrPipe()
	if err != nil {
		return JobResponse{}, err
	}

	if err := child.Start(); err != nil {
		return JobResponse{}, err
	}

	go func() {
		defer stdout.Close()
		defer stderr.Close()

		buf := make([]byte, 1024)
		for {
			n, err := stdout.Read(buf)
			if err != nil {
				return
			}
			fmt.Printf("yt-dlp stdout: %s", buf[:n])
		}
	}()

	go func() {
		defer stderr.Close()

		buf := make([]byte, 1024)
		for {
			n, err := stderr.Read(buf)
			if err != nil {
				return
			}
			fmt.Printf("yt-dlp stderr: %s", buf[:n])
		}
	}()

	backupTimer := time.AfterFunc(newT, func() {
		fmt.Println("Sending SIGINT signal")
		child.Process.Signal(syscall.SIGINT)
	})

	if err := child.Wait(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			if status, ok := exitErr.Sys().(syscall.WaitStatus); ok {
				if status.ExitStatus() == int(syscall.SIGINT) {
					// SIGINT signal sent by backupTimer
					fmt.Println("yt-dlp process was terminated by the timeout")

				}
			}
		}
		return JobResponse{}, err
	}

	backupTimer.Stop()

	// get .mp4 file
	files, err := os.ReadDir("./tmp")
	if err != nil {
		return JobResponse{}, err
	}
	mp4Files := []string{}
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		if strings.Contains(file.Name(), ".mp4") {

			//check if filename starts with id
			if strings.HasPrefix(file.Name(), id) {
				mp4Files = append(mp4Files, file.Name())
			}
		}
	}

	// uploadAllTOS3(mp4Files)

	return JobResponse{
		Status:   "success",
		Reason:   "",
		Paths:    mp4Files,
		Comments: []string{},
	}, nil
}
