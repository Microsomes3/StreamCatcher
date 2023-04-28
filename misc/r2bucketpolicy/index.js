require("dotenv").config();
const aws = require("aws-sdk");

const s3 = new aws.S3({
    endpoint:"https://6d8f181feef622b528f2fc75fbce8754.r2.cloudflarestorage.com",
    credentials:{
        accessKeyId: process.env.ACCESS,
        secretAccessKey: process.env.SECRET
    },
    region:'auto'
});


s3.listObjectsV2({
    Bucket: "maeplet"
},(err,data)=>{
    if(err){
        console.log(err)
    }else{
        console.log(data.Contents.length)
    }
})

s3.putBucketLifecycleConfiguration({
    Bucket: "maeplet",
    LifecycleConfiguration: {
        Rules: [
            {
                Expiration: {
                    Days: 3
                },
                ID: "Delete everything after 3 days",
                Prefix: "",
                Status: "Enabled"
            },
            {
                ID:"abort incomplete multipart uploads",
                Prefix:"",
                Status:"Enabled",
                AbortIncompleteMultipartUpload:{
                    DaysAfterInitiation:3
                }   
            }
        ]
    }
}).promise().then((data)=>{
    console.log(data)
})

s3.getBucketLifecycleConfiguration({
    Bucket: "maeplet"
},(err,data)=>{
    if(err){
        console.log(err)
    }else{
        console.log(data)
    }
})


  console.log(s3);