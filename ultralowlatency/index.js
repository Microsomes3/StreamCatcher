const { spawn } = require("child_process");
const fs = require("fs");
const moment = require("moment");
const axios = require("axios");

// Start Xvfb
const xvfbProcess = spawn("Xvfb", [":99", "-screen", "0", "1024x768x16"]);

xvfbProcess.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

xvfbProcess.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

xvfbProcess.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});


const { checkMultiLive } = require('./helpers/checkLive')

var isWork=null;

function work(){

checkMultiLive([
    isWork,
]).then(async(data) => {
    console.log(isWork);
    const current = moment().unix();
    fs.writeFileSync("./data/test_"+current+".json", JSON.stringify(data));

    try{

        if(data[0].isLive){
           const c2= await axios.post("https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/manualLiveEvent/"+isWork,{
            result:data
           });
           console.log(c2.data);
        }

    }catch(e){}

    setTimeout(()=>{
        isWork=null;
    },1000)
})
}

var allUsernames = [];

var allUsernames = [];

async function fetchUsernames() {
  const us = await axios.get("https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/getLiveStatuses");
  allUsernames = us.data['youtubers'].map(v=>v.username);
}



// Update the usernames every 10 minutes
setInterval(() => {
  fetchUsernames();
}, 10 * 60 * 1000);

(async()=>{
    // Fetch the usernames initially
await fetchUsernames();

    const us = await axios.get("https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/getLiveStatuses");

    allUsernames = us.data['youtubers'].map(v=>v.username);


    setInterval(()=>{
        if(isWork==null){

            //pick a random 1 from the list
            const randomIndex = Math.floor(Math.random() * allUsernames.length);
            const randomUsername = allUsernames[randomIndex];

            isWork=randomUsername;
            work();
        }else{
        }
    },1000)

})();