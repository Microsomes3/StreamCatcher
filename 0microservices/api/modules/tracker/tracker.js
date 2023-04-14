const express = require('express');
const router = express.Router();

const {} = require('../../db/livechecker/livechecker')

router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to tracker API'
    })
});

router.post("/callbackLiveChecker",(req,res)=>{
    console.log(req.body);
    res.json({
        message: "OK"
    })
})

module.exports = router;