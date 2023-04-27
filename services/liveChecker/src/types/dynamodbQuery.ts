

export type QueryItemWithKeyExpressionAndIndex = {
    TableName: string,
    IndexName: string,
    KeyConditionExpression: string,
    ExpressionAttributeValues: {
        [key: string]: string
    }
}

export type QueryAggregateYoutubeWithYoutuberUsername = {
    TableName: string,
    Key:{
        youtubeusername:string
    }
}

export type QueryLiveCheckerPriority = {
    TableName: string,
    IndexName: string,
    KeyConditionExpression: string,
    ExpressionAttributeValues: {
        ":priority": number
    }
}