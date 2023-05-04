import aws from 'aws-sdk';


const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});


export const getAllRecordRequests = async () => {
    const params = {
        TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
    };

    const data = await documentClient.scan(params).promise();

    return data;
}

export const getAllRequestsFromUser = async (username: string) => {
    const params: any = {
        TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
        IndexName: 'username-index',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username': username,
        },
    };

    const result = await documentClient.query(params).promise();

    return result
}

export const getRequestsByAccountId = (accountId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const params: any = {
            TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
            IndexName: 'accountId-index',
            KeyConditionExpression: 'accountId = :accountId',
            ExpressionAttributeValues: {
                ':accountId': accountId,
            },
        };

        documentClient.query(params, (err, data) => {
            if (err) {
                resolve([]);
            } else {
                resolve(data.Items);
            }
        })
    })
};
export const getRequestsByAccountIdAndChannel = (accountId: string, channel: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const params: any = {
            TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
            IndexName: 'accountId-index',
            KeyConditionExpression: 'accountId = :accountId',
            ExpressionAttributeValues: {
                ':accountId': accountId,
            },
        };

        documentClient.query(params, (err, data: any) => {
            if (err) {
                resolve([]);
            } else {

                const filtered = data.Items.filter((item: any) => {
                    return item.username === channel;
                })

                resolve(filtered);
            }
        })
    })
};

export const deleteRecordRequestById = async (id: string, accountId: string): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        const params: any = {
            TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
            Key: {
                id,
            },
        }

        const data = await documentClient.get(params).promise();

        if (data.Item && data.Item.accountId !== accountId) {
            resolve(false);
        } else if (data.Item && data.Item.accountId === accountId) {
            documentClient.delete(params, (err, data) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            })
        } else {
            resolve(false);
        }
    })
}
