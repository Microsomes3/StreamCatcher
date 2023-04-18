const aws = require("aws-sdk");
const moment = require("moment");
const { getLiveStatusv2 } = require('./helpers/checkLivev2')
const axios = require("axios");


const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function handleFunc(username) {
    return new Promise((resolve, reject) => {
        const ex = "/opt/yt-dlp_linux";
        getLiveStatusv2(ex, username).then((res) => {
            resolve(res)
        }).catch((e) => {
            resolve(false)
        })
    })
}


module.exports.processYoutubersToCheck = async (event) => {

    const {
        youtubeusername, type = "youtube" } = JSON.parse(event.Records[0].body);

    const result = await handleFunc(youtubeusername);

    var status = result == true ? true : false

    const params = {
        TableName: process.env.LIVE_CHECKER_TABLE,
        Item: {
            id: uuidv4(),
            createdAt: moment().unix(),
            friendlyDate: moment().format('YYYY-MM-DD'),
            updatedAt: moment().unix(),
            type: type,
            channel: youtubeusername,
            status: JSON.stringify(result),
            isLive: status,
            liveLink: "https://youtube.com/" + youtubeusername + "/live",
        },
    };

    await documentWriter.put(params).promise();



    try {
        await axios.post("https://streamcatcher.herokuapp.com/tracker/callbackLiveChecker", {
            params: params,
        }, {
            timeout: 10000 // 10 seconds
        });
    } catch (err) {
        console.log(err);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'will callback',
        })

    }
}





