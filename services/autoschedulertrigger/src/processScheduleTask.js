const aws = require('aws-sdk');
const { makeRecordRequest } = require('./helpers/submitRecordingsRequest');



function handleFunc(request){
return new Promise(async (resolve,reject)=>{


    const c =await makeRecordRequest({
        requestId: request.id,
    });

    resolve(c);

})
}


module.exports.handler = async (event) => {

    //queue message
    const requestInfo = JSON.parse(event.Records[0].body);

    const status = await handleFunc(requestInfo);


    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'will callback',
            liveStatus: status,
        }),
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
    }
};