const express = require('express');
const router = express.Router();
const allowAuthenticated = require('../../middleware/allowAuthenticated');

const {
    createChannelWithAccount,
    getChannel,
    addChannelToAccount,
    getAllChannelsByAccountId,
    deleteChannelFromAccount,
    getAllChannels
} = require('../../db/record/record');

router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to channel API'
    })
});

router.post('/create', allowAuthenticated, async (req, res) => {
    const {
        channelName,
        platform
    } = req.body;


    if (!channelName || !platform) {
        return res.status(400).json({
            error: 'Missing required fields'
        })
    }

    const exists = await getChannel({
        channelName,
        platform
    })

    if (exists.length > 0) {
        const cid = exists[0].id;

        try {

            const attached = await addChannelToAccount({
                accountId: req.userId,
                channelId: cid
            })

            res.json({
                message: 'Channel already exists, attached to account',
            })

        } catch (err) {
            console.log(">", err);
            res.status(500).json({
                error: 'Error attaching channel to account'
            })
         }

        return;
    }

    createChannelWithAccount({
        channelName,
        platform,
        accountId: req.userId
    }).then((channel) => {
        res.json({
            message: 'Channel created',
            channel
        })
    }).catch((error) => {
        console.log(">", error);
        res.status(500).json({
            error: 'Error creating channel'
        })
    })
})

router.get("/allguest/:platform/:page",allowAuthenticated,(req,res)=>{
    const page = req.params.page;
    const platform = req.params.platform;
    getAllChannels(
        {
            platform:platform,
            page:parseInt(page)
            
        }
    ).then((channels)=>{
        res.json({
            channels
        })
    }).catch((err)=>{
        console.log(">",err);
        res.status(500).json({
            error: 'Error getting channels'
        })
    })
})

router.get("/all/:page",allowAuthenticated,(req,res)=>{
    const page = req.params.page;
    getAllChannelsByAccountId(
        {
            accountId: req.userId,
            page:parseInt(page)
            
        }
    ).then((channels)=>{
        res.json({
            channels
        })
    }).catch((err)=>{
        console.log(">",err);
        res.status(500).json({
            error: 'Error getting channels'
        })
    })
})

router.delete("/delete/:id",allowAuthenticated,(req,res)=>{
    const id = req.params.id;
    deleteChannelFromAccount({
        accountId: req.userId,
        channelId: id
    }).then((deleted)=>{
        res.json({
            message: 'Channel deleted',
            deleted
        })
    }).catch((err)=>{
        console.log(">",err);
        res.status(500).json({
            error: 'Error deleting channel'
        })
    })
})

module.exports = router;