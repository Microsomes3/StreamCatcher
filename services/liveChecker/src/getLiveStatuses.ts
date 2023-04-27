import aws from "aws-sdk";
import moment from 'moment';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { LiveItem } from './types/liveItem'

const documentReader = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});



module.exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const params: any = {
        TableName: process.env.AGGREGATE_CURRENT_YOUTUBER_LIVE_TABLE,
    };

    const data = await documentReader.scan(params).promise();

    var items: LiveItem[] = [];

    if (data.Items) {
        
        data.Items.forEach(item => {
            items.push({
                islive: item.isLive,
                username: item.youtubeusername,
                lastUpdated: moment(item.updatedAt).fromNow(),
                liveLink: item.liveLink,
                type: item.type || "youtube",
                recordRequests: item.recordRequests || 0,
                link: `https://youtube.com${item.liveLink}&ab_channel=${item.youtubeusername.split("@")[1]}`
            })
        })

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                youtubers: items,
            }),
        }
    }else{
        return {
            statusCode:200,
            body:JSON.stringify({
                msg:"No data found"
            })
        }
    }
}