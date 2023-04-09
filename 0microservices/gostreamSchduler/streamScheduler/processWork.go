package streamscheduler

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"
	"time"

	"encore.dev/types/uuid"
	serverhelpers "microsomes.com/streamscheduler/serverHelpers"
	"microsomes.com/streamscheduler/utils"
)

var lockFind sync.Mutex = sync.Mutex{}

func CreateServerAndWaitForCompletion(done chan bool, resultChan chan utils.Server) {
	hez := serverhelpers.Hezner{}
	sid, _ := uuid.NewV4()
	serverDetails, err := hez.CreateServer(sid.String())

	fmt.Println("server id is", serverDetails)

	if err != nil {
		fmt.Println("error creating server", err)
	}

	time.Sleep(10 * time.Second)

	done <- true
	resultChan <- utils.Server{
		Provider: "hezner",
		ID:       serverDetails.Server.ID,
		Name:     serverDetails.Server.Name,
		PublicIP: "",
	}
}

type WorkerStatus struct {
	TotalQueue     int `json:"totalQueue"`
	TotalRecording int `json:"totalRecording"`
	TotalDone      int `json:"totalDone"`
	TotalDuration  int `json:"totalDuration"`
}

func seeIfServerIsSuitable(publicIp string) bool {

	httpClient := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := httpClient.Get("http://" + publicIp + ":9005/workerStatus")

	if err != nil {
		fmt.Println("error getting worker status", err)
		return false
	}

	defer resp.Body.Close()

	bytes, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		fmt.Println("error reading body", err)
		return false
	}

	var workerStatus WorkerStatus

	err = json.Unmarshal(bytes, &workerStatus)

	if err != nil {
		fmt.Println("error unmarshalling", err)
		return false
	}

	fmt.Println("worker status is", workerStatus)

	if workerStatus.TotalDuration > serverhelpers.HEZNER_MAX_WORK_SECONDS_PER_SERVER {
		return false //too much work has been allocated to this server
	}

	fmt.Println("response is", string(bytes))

	time.Sleep(3 * time.Second)
	return true
}

func findAvailableServer() (utils.Server, error) {
	lockFind.Lock()
	defer lockFind.Unlock()
	hez := serverhelpers.Hezner{}

	servers, _ := hez.ListServers()

	if len(servers.Servers) == 0 {
		//provision a server
		fmt.Println("provisioning a server")
		createCn := make(chan bool)
		resultCn := make(chan utils.Server)
		go CreateServerAndWaitForCompletion(createCn, resultCn)
		<-createCn

		return <-resultCn, nil
	}

	totalCurrentServers := len(servers.Servers)

	//find random server
	for _, server := range servers.Servers {
		if seeIfServerIsSuitable(server.PublicNet.IPv4.IP) {
			return utils.Server{
				Provider: "hezner",
				ID:       server.ID,
				Name:     server.Name,
				PublicIP: server.PublicNet.IPv4.IP,
			}, nil
		}
	}

	//this means we didnt maange to find a server, check if we can provision a new one

	if totalCurrentServers < serverhelpers.HEZNER_MAX_INSTANCE {
		fmt.Println("provisioning a server")
		createCn := make(chan bool)
		resultCn := make(chan utils.Server)

		go CreateServerAndWaitForCompletion(createCn, resultCn)
		<-createCn
		return <-resultCn, nil
	}

	return utils.Server{}, errors.New("no servers available")
}

func AssignJobToServer(job utils.JobRequest) {
	availableServer, err := findAvailableServer()

	if err != nil {
		fmt.Println("error finding available server", err)

		//we would typically notify the admin, and send a webook to the client to let them know so they can retry
	} else {

		fmt.Println("available server is", availableServer.ID)
		fmt.Println("available server ip", availableServer.PublicIP)
	}
}
