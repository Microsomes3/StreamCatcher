package streamutil

import (
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

type DLPUploader struct{}

const (
	accountid = "6d8f181feef622b528f2fc75fbce8754"
)

var bucket = aws.String("maeplet")
var ACCESSKEY = os.Getenv("R2_ACCESS_KEY")
var SECRETKEY = os.Getenv("R2_SECRET_KEY")

func (d *DLPUploader) UploadFile(file *os.File, key string, index string) (string, error) {

	s3Config := aws.Config{
		Region:      aws.String("eeur"),
		Endpoint:    aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountid)),
		Credentials: credentials.NewStaticCredentials(ACCESSKEY, SECRETKEY, ""),
	}

	s3Session := session.New(&s3Config)

	uploader := s3manager.NewUploader(s3Session)

	fkey := index + "_" + key

	input := &s3manager.UploadInput{
		Bucket:      bucket,
		Key:         aws.String(fkey),
		Body:        file,
		ContentType: aws.String("video/mp4"),
	}

	_, err := uploader.UploadWithContext(aws.BackgroundContext(), input)

	//get events

	if err != nil {
		return "", err
	}

	return "https://pub-cf9c58b47aaa413eadbc9d4fba77649a.r2.dev/" + fkey, nil

}
