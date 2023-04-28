

# docker run  -e updatehook="https://c332-77-102-234-41.ngrok-free.app" -e jobid="exampleid" -e reqid="examplereqid" -e videoLink="https://d213lwr54yo0m8.cloudfront.net/example_video.mkv" -e audioLink="https://d213lwr54yo0m8.cloudfront.net/example_audio.mkv" mux

updatehook="https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GoMuxUpdateRecordCallback" jobid="3cc6d056-bf37-4787-9334-1d22324dc70a" reqid="9b33a957-576e-4c02-a04c-05e9bfa00ef4" videoLink="https://d213lwr54yo0m8.cloudfront.net/0_3cc6d056-bf37-4787-9334-1d22324dc70a.mp4" audioLink="https://d213lwr54yo0m8.cloudfront.net/1_3cc6d056-bf37-4787-9334-1d22324dc70a.mp4"   go run main.go


#  docker run -e jobid="jobid2" -e reqid="reqid2" -e videoLink="https://d213lwr54yo0m8.cloudfront.net/example_video.mkv" -e audioLink="https://d213lwr54yo0m8.cloudfront.net/example_audio.mkv" -e updatehook="https://c332-77-102-234-41.ngrok-free.app"  ex
