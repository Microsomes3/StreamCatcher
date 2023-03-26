const aws = require("aws-sdk");
const moment = require("moment");
const { getLiveStatusv2 } = require('./helpers/checkLivev2')


const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// function processLiveStatus(liveStatus) {
//     return new Promise(async (resolve, reject) => {
//         try {

//         const params = {
//             TableName: process.env.LIVE_CHECKER_TABLE,
//             Item: {
//                 id: uuidv4(),
//                 createdAt: moment().unix(),
//                 updatedAt: moment().unix(),
//                 channel: liveStatus.username,
//                 status: JSON.stringify(liveStatus),
//                 isLive: liveStatus.isLive,
//                 liveLink: liveStatus.liveLink,
//             },
//         };

//         await documentWriter.put(params).promise();

//     })
// }



function handleFunc(username){
    return new Promise((resolve,reject)=>{
        const ex = "/opt/yt-dlp_linux";
        getLiveStatusv2(ex, username).then((res)=>{
           resolve(res)
        }).catch((e)=>{
            resolve(false)
        })
    })
}


module.exports.processYoutubersToCheck = async (event) => {

    const usernameToCheck = event.Records[0].body;

    const result = await handleFunc(usernameToCheck);

    var status = result == true ?  true:false
    
    const params = {
        TableName: process.env.LIVE_CHECKER_TABLE,
        Item: {
            id: uuidv4(),
            createdAt: moment().unix(),
            updatedAt: moment().unix(),
            channel: usernameToCheck,
            status: JSON.stringify(result),
            isLive: status,
            liveLink: "https://youtube.com/"+usernameToCheck+"/live",
        },
    };

    await documentWriter.put(params).promise();
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'will callback',
        })

    }
}





