package serverkiller

import (
	"fmt"
	"sync"
	"time"

	serverhelpers "microsomes.com/streamscheduler/serverHelpers"
	"microsomes.com/streamscheduler/utils"
)

type ServerKiller struct {
	LockLookForIdleServers *sync.Mutex
	checkQueue             chan int
}

func NewServerKiller(LockIdle *sync.Mutex) *ServerKiller {
	return &ServerKiller{
		checkQueue:             make(chan int, 10),
		LockLookForIdleServers: LockIdle,
	}
}

func (s *ServerKiller) CheckServerIsIdleAndOver1HourOld() []utils.Server {
	s.LockLookForIdleServers.Lock()
	defer s.LockLookForIdleServers.Unlock()

	hez := serverhelpers.Hezner{}

	servers, _ := hez.ListServers()

	toReturn := []utils.Server{}

	for _, server := range servers.Servers {
		var created string = server.Created
		var layout = "2006-01-02T15:04:05Z"
		var timeCreated, _ = time.Parse(layout, created)
		var now = time.Now()
		var diff = now.Sub(timeCreated)

		fmt.Println()

		if time.Duration(diff.Hours()) >= 1*time.Hour {
			// fmt.Println("server is over 1 hour old")

			fmt.Println(diff.Hours())
			fmt.Println(server.Name, server.Created)
			fmt.Println(server.PublicNet.IPv4.IP, server.Created)

			status, _ := utils.GetServerWorkerStatus(server.PublicNet.IPv4.IP)

			if status.TotalDuration > 0 {
				fmt.Println("server is not idle, we should leave it alone")
				continue
			} else {
				toReturn = append(toReturn, utils.Server{
					Provider: "hezner",
					ID:       server.ID,
					Name:     server.Name,
					PublicIP: server.PublicNet.IPv4.IP,
				})
			}

		}

	}

	return toReturn
}

func (s *ServerKiller) Work() {
	for w := range s.checkQueue {
		fmt.Println("working on", w)

		servers := s.CheckServerIsIdleAndOver1HourOld()

		for _, server := range servers {

			//signal the server to shut down
			utils.SignalWorkerToDie(server.PublicIP)

			//lets give the server 30 seconds then kill it
			time.Sleep(30 * time.Second)
			hez := serverhelpers.Hezner{}
			idString := fmt.Sprintf("%d", server.ID)
			hez.DeleteServer(idString)

		}

		fmt.Println("done working on", w)
	}

	fmt.Println("done working")
}

func (s *ServerKiller) Tick(done chan bool) {
	for {
		select {
		case <-done:
			return
		case <-time.After(1 * time.Minute):
			fmt.Println("tick")
			s.checkQueue <- int(time.Now().Unix())
		}

	}
}
