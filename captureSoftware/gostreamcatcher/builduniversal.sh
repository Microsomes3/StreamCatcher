echo "build universal binaries"
GOOS=linux GOARCH=amd64 go build -o bin/godwn


aws s3 cp bin/godwn s3://scrapes69/gostreamcatcher/godwn
aws s3 cp .env s3://scrapes69/gostreamcatcher/.env
aws s3 cp bin/goapi.service  s3://scrapes69/gostreamcatcher/goapi.service

aws s3 cp build/universalbuild.sh s3://scrapes69/gostreamcatcher/universalbuild.sh