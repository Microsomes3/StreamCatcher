const axios = require("axios");
const { publishProgressUpdate } = require('./publishProgressUpdate')

function processNotLive({ channel, statusCallbackUrl, recordID, recordRequestId }) {
    return new Promise(async (resolve, reject) => {
        try {
          await publishProgressUpdate({
            status: "failed",
            reason: "not live",
            recordID,
            recordRequestId,
            statusCallbackUrl,
            paths:[]
          })
        } catch (err) { 
            resolve()
        }finally{
            resolve()
        }
    })
}







module.exports = {
    processNotLive
}