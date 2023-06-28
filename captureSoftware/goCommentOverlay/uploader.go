package main

import (
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

type DLPUploader struct{}

const (
	accountid = "6d8f181feef622b528f2fc75fbce8754"
)

var bucket = aws.String("griffin-record-input")

func (d *DLPUploader) UploadFile(file *os.File, key string, index string) (string, error) {

	var retryCount = 0
	var maxRetry = 3

	s3Config := aws.Config{
		Region: aws.String("us-east-1"),
	}

	s3Session := session.New(&s3Config)

	uploader := s3manager.NewUploader(s3Session, func(u *s3manager.Uploader) {
		u.PartSize = 20 * 1024 * 1024 // 20MB per part
		u.Concurrency = 5
	})

	fkey := index + "_" + key

	input := &s3manager.UploadInput{
		Bucket:      bucket,
		Key:         aws.String(fkey),
		Body:        file,
		ContentType: aws.String("video/mp4"),
	}

	_, err := uploader.UploadWithContext(aws.BackgroundContext(), input)

	if err != nil {
		fmt.Println(err.Error())

		if retryCount < maxRetry {
			retryCount++
			fmt.Println("retrying upload")
			return d.UploadFile(file, key, index)
		}

		return "", err
	}

	return "https://d213lwr54yo0m8.cloudfront.net/" + fkey, nil

}
