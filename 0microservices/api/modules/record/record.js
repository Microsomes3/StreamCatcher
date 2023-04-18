const express = require('express');
const router = express.Router();
const allowAuthenticated = require('../../middleware/allowAuthenticated');

const {
    addRecordingSchedule,
    getAllRecordingSchedules,
    getRecordScheduleById,
    deleteRecordingScheduleById
    
} = require('../../db/record/record')

router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to record API'
    })
});

router.post("/create",allowAuthenticated,async (req,res)=>{
    const {duration,recordStart,label,triggerMode,triggerInterval,triggerTime, channelId} = req.body;

    if(!duration ||!label ||!triggerMode ||!channelId){
        return res.status(400).json({
            error: 'Missing required fields',
            fields:[
                "duration",
                "label",
                "triggerMode",
                "channelId"
            ],
            values:{
                duration:30,
                label:"anything",
                triggerMode:['wheneverlive', 'interval', 'time']
            }
        })
    }

    //channelId must be a number
    if(isNaN(channelId)){
        return res.status(400).json({
            error: 'Invalid channelId',
            fields:[
                "channelId"
            ],
            values:{
                channelId:1
            }
        })
    }

    //check if recordStart is a boolean
    if(typeof recordStart !== "boolean"){
        return res.status(400).json({
            error: 'Invalid recordStart',
            fields:[
                "recordStart"
            ],
            values:{
                recordStart:true
            }
        })
    }

    //make sure duration is a number
    if(isNaN(duration)){
        return res.status(400).json({
            error: 'Invalid duration',
            fields:[
                "duration"
            ],
            values:{
                duration:30
            }
        })
    }

    const triggerModes = ['wheneverlive', 'interval', 'time'];
    const triggerModeExists = triggerModes.includes(triggerMode);

    if(!triggerModeExists){
        return res.status(400).json({
            error: 'Invalid triggerMode',
            fields:[
                "triggerMode"
            ],
            values:{
                triggerMode:['wheneverlive', 'interval', 'time']
            }
        })
    }

    const allowedIntervals = [5,10,15,20,25,30,35,40,45,50,55,60];

    var tor = null;

    switch(triggerMode){
        case "wheneverlive":
            tor = await addRecordingSchedule({
                accountId:req.userId,
                channelId: channelId,
                duration: duration,
                recordStart: recordStart,
                label: label,
                triggerMode: triggerMode,
                triggerInterval: "0",
                triggerTime:"0"
            })
            console.log(tor);
            break;
        case "interval":
            const intervalExists = allowedIntervals.includes(triggerInterval);
            if(!intervalExists){
                return res.status(400).json({
                    error: 'Invalid triggerInterval',
                    fields:[
                        "triggerInterval"
                    ],
                    values:{
                        triggerInterval:allowedIntervals
                    }
                })
            }else{
                console.log("interval");
                tor = await addRecordingSchedule({
                    accountId:req.userId,
                    channelId: channelId,
                    duration: duration,
                    recordStart: recordStart,
                    label: label,
                    triggerMode: triggerMode,
                    triggerInterval: triggerInterval,
                    triggerTime:"0"
                })
                console.log(tor);
            }
            

            break;

    }

    res.json({
        msg:"OK",
        data:{
            createdId:tor,
            msg: tor!=null ? "Created" : "Failed"
        }
    })

    



})

router.get("/all",allowAuthenticated,async (req,res)=>{

    var page = parseInt(req.query.page) || 0

    const schedules = await getAllRecordingSchedules({
        accountId:req.userId,
        page:page
    });

    res.json({
        schedules:schedules
    })
})

router.get("/:id",allowAuthenticated,async (req,res)=>{
    const recordScheduleId = req.params.id
    const accountId = req.userId

    const schedule = await getRecordScheduleById({
        accountId:accountId,
        recordScheduleId:recordScheduleId
    })

    res.json({
        schedule:schedule
    })
})

router.delete("/:id",allowAuthenticated,async (req,res)=>{
    const recordScheduleId = req.params.id
    const accountId = req.userId

    const schedule = await deleteRecordingScheduleById({
        accountId:accountId,
        recordScheduleId:recordScheduleId
    })

    res.json({
        status:"deleted"
    })
})

module.exports = router;