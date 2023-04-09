package serverhelpers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"microsomes.com/streamscheduler/utils"
)

type HezerServerResponse struct {
	Servers []struct {
		ID        int    `json:"id"`
		Name      string `json:"name"`
		Created   string `json:"created"`
		PublicNet struct {
			IPv4 struct {
				IP string `json:"ip"`
			} `json:"ipv4"`
		} `json:"public_net"`
	} `json:"servers"`
}

type Hezner struct{}

func (h *Hezner) CreateServerWithSnapshot(name string) error {
	apiToken := HEXNER_TOKEN
	bodyData := map[string]interface{}{
		"automount":  false,
		"datacenter": "nbg1-dc3",
		"image":      HEZNER_SNAPSHOT,
		"labels":     map[string]string{},
		// "location":           "nbg1",
		"name": "go" + name,
		// "placement_group":    1,
		"public_net":         map[string]interface{}{"enable_ipv4": true, "enable_ipv6": false},
		"server_type":        "cx11",
		"start_after_create": true,
	}
	response, err := HetznerAPICreateRequest(apiToken, bodyData)
	if err != nil {
		return err
	}
	fmt.Println(string(response))

	return nil
}

type CreateResponse struct {
	Server struct {
		ID      int       `json:"id"`
		Name    string    `json:"name"`
		Status  string    `json:"status"`
		Created time.Time `json:"created"`
	} `json:"server"`
}

func (h *HezerServerResponse) GetServer(serverId string) {}

func (h *Hezner) CreateServer(name string) (CreateResponse, error) {
	fmt.Println("Creating server with name: " + name)
	imageToUse := HEZNER_IMAGE
	initScript, err := utils.DownloadText(imageToUse)
	if err != nil {
		return CreateResponse{}, err
	}

	apiToken := HEXNER_TOKEN
	bodyData := map[string]interface{}{
		"automount":  false,
		"datacenter": "nbg1-dc3",

		"image":  "ubuntu-22.04",
		"labels": map[string]string{},
		// "location":           "nbg1",
		"name": "go" + name,
		// "placement_group":    1,
		"public_net":         map[string]interface{}{"enable_ipv4": true, "enable_ipv6": false},
		"server_type":        "cx11",
		"start_after_create": true,
		"user_data":          initScript,
	}
	response, err := HetznerAPICreateRequest(apiToken, bodyData)
	fmt.Println(err)
	if err != nil {
		return CreateResponse{}, err
	}

	var crResponse CreateResponse

	err = json.Unmarshal(response, &crResponse)

	if err != nil {
		return CreateResponse{}, err
	}

	return crResponse, nil
}

func (h *Hezner) DeleteServer(serverID string) error {

	apiToken := HEXNER_TOKEN

	// Set the URL of the Hetzner API endpoint
	apiUrl := "https://api.hetzner.cloud/v1/servers/" + serverID

	// Create a new HTTP DELETE request
	req, err := http.NewRequest("DELETE", apiUrl, nil)
	if err != nil {
		return err
	}

	// Set the request headers
	req.Header.Set("Authorization", "Bearer "+apiToken)

	// Create a new HTTP client
	client := &http.Client{}

	// Send the HTTP request
	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	// Check the response status code
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Failed to delete server. Status code: %d", resp.StatusCode)
	}

	return nil
}

func (h *Hezner) ListServers() (HezerServerResponse, error) {

	res, err := HetznerListAPIRequest(HEXNER_TOKEN)

	if err != nil {
		return HezerServerResponse{}, err
	}

	var data HezerServerResponse

	err = json.Unmarshal(res, &data)

	if err != nil {
		return HezerServerResponse{}, err
	}

	return data, nil
}

func HetznerListAPIRequest(apiToken string) ([]byte, error) {
	url := "https://api.hetzner.cloud/v1/servers"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiToken))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	return body, nil
}

func HetznerAPICreateRequest(apiToken string, bodyData map[string]interface{}) ([]byte, error) {
	url := "https://api.hetzner.cloud/v1/servers"
	body, err := json.Marshal(bodyData)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiToken))
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	responseBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return responseBody, nil
}
