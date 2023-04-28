import aws from 'aws-sdk';


const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});


const getAllRecordRequests = async () => {
    const params = {
        TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
    };

    const data = await documentClient.scan(params).promise();

    return data;
}

export const getAllRequestsFromUser = async (username:string) => {
    const params:any = {
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




module.exports = {
    getAllRecordRequests,
    getAllRequestsFromUser
};