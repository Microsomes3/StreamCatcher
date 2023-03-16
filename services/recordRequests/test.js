const { getAllRecordRequests, getAllRequestsFromUser } = require('./helpers/rdrequestsHelper')


// getAllRecordRequests().then((data)=>{
//     console.log(data);
// })


getAllRequestsFromUser("@griffingdaming").then((data)=>{
    console.log(data.Items.length)
})