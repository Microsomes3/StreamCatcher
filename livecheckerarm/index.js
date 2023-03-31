console.log("livechecker")

const { getLiveStatusv2 } = require('./helpers/getLive')

getLiveStatusv2("yt-dlp","@CreepsMcPasta")
.then((res)=>{
    console.log(res)
})