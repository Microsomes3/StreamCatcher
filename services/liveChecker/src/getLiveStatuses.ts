import aws from "aws-sdk";
import moment from 'moment';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { LiveItem } from './types/liveItem'
import axios from 'axios';
import { getAllChannelsForAccount, getAggregateChannel } from './helpers/db'

const documentReader = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});



module.exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    try{
    const user = await axios.get("https://21tk2wt1ye.execute-api.us-east-1.amazonaws.com/dev/me", {
        headers: {
            'Authorization': event.headers.Authorization,
        }
    })

    const { id, email }: { id: string, email: string } = user.data.user;


    const channels: Array<any> = await getAllChannelsForAccount(id);

    const aggregateData: any = []

    var items: LiveItem[] = [];




    for (var i = 0; i < channels.length; i++) {
        const channel = channels[i];
        const item = await getAggregateChannel(channel.ytusernameaccountid);

        items.push({
            islive: item.isLive,
            username: item.youtubeusername,
            lastUpdated: moment(item.updatedAt).fromNow(),
            liveLink: item.liveLink,
            type: item.type || "youtube",
            recordRequests: item.recordRequests || 0,
            link: `https://youtube.com${item.liveLink}&ab_channel=${item.youtubeusername.split("@")[1]}`
        })

    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            channels: channels,
            userId: id,
            youtubers: items
        }),
    }

} catch (err) {
    console.log(err);
    return {
        statusCode: 500,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            error: err,
        }),
    };
}

    
}