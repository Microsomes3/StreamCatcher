package streamcatcher

import (
	"os/exec"
	"strings"
)

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
