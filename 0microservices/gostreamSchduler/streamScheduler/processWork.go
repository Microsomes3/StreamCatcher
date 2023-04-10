package streamscheduler

import (
	"bytes"
	"context"
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

func IsServerReady(serverId string, signalReady chan bool, responseChan chan string) {
	bbyr, err := serverhelpers.HeznerGetServerById(serverhelpers.HEXNER_TOKEN, serverId)

	if err != nil {
		signalReady <- false
	}

	var serverResponse serverhelpers.HeznerServer

	err = json.Unmarshal(bbyr, &serverResponse)

	responseChan <- serverResponse.Server.PublicNet.Ipv4.IP

	if err != nil {
		signalReady <- false
	}

	fmt.Println("server status is", serverResponse.Server.PublicNet.Ipv4.IP)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)

	wg1 := sync.WaitGroup{}

	wg1.Add(1)

	go func(wg1 sync.WaitGroup, ctx context.Context) {
		defer cancel()
		defer wg1.Done()
		for {
			select {
			case <-ctx.Done():
				fmt.Println("context done")
				signalReady <- false
				return
			default:
				fmt.Println("checking server status")

				serverIpString := fmt.Sprintf("%v", serverResponse.Server.PublicNet.Ipv4.IP)
				s, err := utils.GetServerWorkerStatus(serverIpString)

				if err != nil {
					fmt.Println("error getting server status", err)
				} else {

					fmt.Println(s)

					fmt.Println("server is ready, signal ready")

					ctx.Done()
					signalReady <- true
					return

				}

				time.Sleep(30 * time.Second)
			}
		}
	}(wg1, ctx)

	wg1.Wait()

	signalReady <- true
}

func CreateServerAndWaitForCompletion(done chan bool, resultChan chan utils.Server) {
	hez := serverhelpers.Hezner{}
	sid, _ := uuid.NewV4()
	serverDetails, err := hez.CreateServer(sid.String())

	fmt.Println("server id is", serverDetails)

	if err != nil {
		fmt.Println("error creating server", err)
	}

	isSeverReady := make(chan bool)
	responseChannel := make(chan string)

	go IsServerReady(fmt.Sprintf("%v", serverDetails.Server.ID), isSeverReady, responseChannel)

	serverIp := <-responseChannel

	fmt.Println("new server ip is", serverIp)

	<-isSeverReady

	done <- true
	resultChan <- utils.Server{
		Provider: "hezner",
		ID:       serverDetails.Server.ID,
		Name:     serverDetails.Server.Name,
		PublicIP: serverIp,
	}
}

func submitJobToServer(publicIp string, job utils.SteamJob) error {
	fmt.Println("submitting job to server", publicIp, job)

	datab, err := json.Marshal(job)

	if err != nil {
		return err
	}

	httpClient := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := httpClient.Post("http://"+publicIp+":9005/addJob", "application/json", bytes.NewBuffer(datab))

	if err != nil {
		return err
	}

	defer resp.Body.Close()

	bytes, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		return err
	}

	fmt.Println("response from server", string(bytes))

	return nil
}

func seeIfServerIsSuitable(publicIp string, job utils.JobRequest) bool {
	workerStatus, err := utils.GetServerWorkerStatus(publicIp)

	if err != nil {
		fmt.Println("error getting worker status", err)
		return false
	}

	fmt.Println("worker status is", workerStatus)

	if (workerStatus.TotalDuration + job.Timeout) > serverhelpers.HEZNER_MAX_WORK_SECONDS_PER_SERVER {
		return false //too much work has been allocated to this server
	}

	return true
}

func findAvailableServer(job utils.JobRequest) (utils.Server, error) {
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

		serverToUse := <-resultCn

		if seeIfServerIsSuitable(serverToUse.PublicIP, job) {
			return serverToUse, nil
		} else {
			return utils.Server{}, errors.New("could not find a suitable server")
		}

		return <-resultCn, nil
	}

	totalCurrentServers := len(servers.Servers)

	//find random server
	for _, server := range servers.Servers {
		if seeIfServerIsSuitable(server.PublicNet.IPv4.IP, job) {
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
	availableServer, err := findAvailableServer(job)

	if err != nil {
		fmt.Println("error finding available server", err)

		//we would typically notify the admin, and send a webook to the client to let them know so they can retry
	} else {

		fmt.Println("available server is", availableServer.ID)
		fmt.Println("available server ip", availableServer.PublicIP)

		err := submitJobToServer(availableServer.PublicIP, utils.SteamJob{
			JobID:          job.ID,
			YoutubeLink:    job.YoutubeURL,
			TimeoutSeconds: job.Timeout,
			IsStart:        job.IsStart,
			UpdateHook:     job.UpdateHook,
		})

		if err != nil {
			fmt.Println("error submitting job to server", err)
		}

	}
}
