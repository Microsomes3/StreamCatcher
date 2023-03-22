
const { checkScheduleC } = require('./helpers/checkScheduleStandalone');


(async ()=>{
   const r =  await checkScheduleC();

   console.log(r);
})()

module.exports.handler = async (event) => {

    //scan all

    const allDs = await checkScheduleC();
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            live: allDs
        }),
    };
};