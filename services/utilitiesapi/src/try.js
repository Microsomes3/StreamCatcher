const { getLiveStatus } = require('./helpers/getLiveindex');


const ex="/opt/yt-dlp_linux";

console.log(ex);


getLiveStatus('yt-dlp',"https://www.youtube.com/@CreepsMcPasta/live").then((data)=>{
    console.log(">",data,"<")
});