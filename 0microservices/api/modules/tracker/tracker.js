const express = require('express');
const router = express.Router();

const {
    addLiveEvent,
} = require('../../db/livechecker/livechecker')

const {
    addRecording,
    getChannel
} = require("../../db/record/record")

router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to tracker API'
    })
});

router.post("/callbackLiveChecker",async(req,res)=>{
    const {channel,isLive,type}=req.body.params.Item

   const c= await addLiveEvent({
        username:channel,
        isLive,
        platform:type
    })

    console.log(c);

    res.json({
        message: "OK"
    })
})

router.post("/callbackRecordStatus",async (req,res)=>{
    console.log(req.body);

    const {jobId, reqId,channelName,provider} = req.body.Job;
    const {state,result} = req.body.Status;

    const f = await getChannel({
        channelName:channelName,
        platform:provider
    })

    var channelId = f[0].id;

    console.log("channelid>>",channelId);

  

    res.json({
        message: "OK"
    })
})

module.exports = router;