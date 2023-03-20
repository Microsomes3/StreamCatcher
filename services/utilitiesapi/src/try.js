const { getLiveIndex } = require('./helpers/getLiveindex');


const ex="/opt/yt-dlp_linux";

console.log(ex);


getLiveIndex('yt-dlp',"https://www.youtube.com/watch?v=Gnzw6IRSa5E&ab_channel=GametechUK").then((data)=>{
    console.log(">",data,"<")
});