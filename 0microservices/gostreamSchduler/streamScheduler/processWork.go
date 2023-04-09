package streamscheduler

import (
	"fmt"

	"encore.dev/types/uuid"
	serverhelpers "microsomes.com/streamscheduler/serverHelpers"
	"microsomes.com/streamscheduler/utils"
)

func CreateServerAndWaitForCompletion() {
	hez := serverhelpers.Hezner{}
	sid, _ := uuid.NewV4()
	serverDetails, err := hez.CreateServer(sid.String())

	fmt.Println(err)

	fmt.Println("server id is", serverDetails)
}

func AssignJobToServer(job utils.JobRequest) {

	//check if any servers exist

	hez := serverhelpers.Hezner{}

	servers, _ := hez.ListServers()

	if len(servers.Servers) == 0 {
		//provision a server
		fmt.Println("provisioning a server")
		CreateServerAndWaitForCompletion()
	}

}
