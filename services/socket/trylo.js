const axios = require('axios');


axios.post("http://localhost:3000/dev/sendMessage2/{recordid}",{
    action: "kill"
}).then((res)=>{
    console.log(res.data.data)
}).catch((err)=>{console.log(err)})