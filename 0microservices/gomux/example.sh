

# docker run  -e updatehook="https://c332-77-102-234-41.ngrok-free.app" -e jobid="exampleid" -e reqid="examplereqid" -e videoLink="https://d213lwr54yo0m8.cloudfront.net/example_video.mkv" -e audioLink="https://d213lwr54yo0m8.cloudfront.net/example_audio.mkv" mux

# updatehook="https://c332-77-102-234-41.ngrok-free.app" jobid="exampleid" reqid="examplereqid" videoLink="https://d213lwr54yo0m8.cloudfront.net/example_video.mkv" audioLink="https://d213lwr54yo0m8.cloudfront.net/example_audio.mkv"   go run main.go


 docker run -e jobid="jobid2" -e reqid="reqid2" -e videoLink="https://d213lwr54yo0m8.cloudfront.net/example_video.mkv" -e audioLink="https://d213lwr54yo0m8.cloudfront.net/example_audio.mkv" -e updatehook="https://c332-77-102-234-41.ngrok-free.app"  ex
