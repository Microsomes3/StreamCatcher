# GOStreamCatcher
Go Stream Catcher is a wrapper around yt-dlp or ytarchive, it allows a safer more controlled execution of recording youtube videos and it also has experimental support for twitch.

This wrapper accepts a youtube link, a timeout in seconds, this is to ensure their is a max timelimit so we don't hog resources longer then required, for example recording a 24/7 streamer but we are only interested in 6 hours so thats a timeout of 21600

This wrapper accepts a callback url to provide status updates during the process. The entire thing is written in Golang and can be modified as per your request.

I built this to manage downloads for Liveclipper.com, a hosted platform for recording youtube videos.