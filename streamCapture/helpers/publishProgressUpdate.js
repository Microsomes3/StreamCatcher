const axios = require("axios");



function publishProgressUpdate({
    status,
    reason,
    paths,
    recordID,
    recordRequestId,
    statusCallbackUrl,
    friendlyName=""
}){
    return new Promise(async (resolve,reject)=>{
        try {
            const res = await axios.post(statusCallbackUrl, {
                requestId: recordRequestId,
                keys: paths,
                friendlyName:friendlyName,
                status: {
                    status: status,
                    reason: reason
                },
                recordId: recordID,
            }, {
                timeout: 10000 // timeout after 10 seconds
            });
            resolve(res)
        } catch (err) { 
            resolve()
        }finally{
            resolve()
        }
    })
}


module.exports = {
    publishProgressUpdate
}