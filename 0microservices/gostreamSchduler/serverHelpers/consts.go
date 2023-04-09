package serverhelpers

import "microsomes.com/streamscheduler/utils"

const (
	AWS_IMAGE     = "ami-09e63262a553e542f"
	HEZNER_IMAGE  = "https://scrapes69.s3.eu-west-1.amazonaws.com/gostreamcatcher/universalbuild.sh"
	DIGITAL_OCEAN = "https://scrapes69.s3.eu-west-1.amazonaws.com/gostreamcatcher/universalbuild.sh"

	AWS_MAX_INSTANCE    = 2
	HEZNER_MAX_INSTANCE = 2
	DO_MAX_INSTANCE     = 2

	HEZNER_SNAPSHOT = "106427946"

	HEZNER_MAX_WORK_SECONDS_PER_SERVER = 50000 //13 hours

	HEXNER_TOKEN = utils.HEXNER_TOKEN
	DO_TOKEN     = utils.DO_TOKEN
)
