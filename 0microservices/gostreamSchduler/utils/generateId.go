package utils

import "encore.dev/types/uuid"

func GenerateId() (string, error) {
	uuid, err := uuid.NewV4()
	if err != nil {
		return "", err
	}
	return "autoscheduler_" + uuid.String(), nil
}
