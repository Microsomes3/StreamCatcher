const fs = require('fs');
const aws = require('aws-sdk');
const { makeDemoClip } = require('./helpers/democlipgenerator')

const s3 = new aws.S3({
    region: process.env.AWS_REGION_T,
});


function handleFunc(username){
    return new Promise((resolve,reject)=>{
        //if videos folder exists delete it
        if(fs.existsSync(`/tmp/videos`)){
            fs.rmdirSync(`/tmp/videos`,{recursive:true});
        }

        makeDemoClip(username).then((result)=>{
            console.log(result);
            const params = {
                Bucket: process.env.DEMO_CLIP_BUCKET || 'griffin-demo-clip',
                Key: `${username}_demo.mp4`,
                Body: fs.createReadStream('/tmp/videos/'+result),
                ACL: 'public-read',
                ContentType: 'video/mp4'
            }

            s3.upload(params, function (err, data) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                if (data) {
                    console.log(data);
                    resolve(data);
                }
            });
        });


    })
}


module.exports.handler = async (event) => {
    const username = event.pathParameters.username;

    try{
    const c = await handleFunc(username);

    return {
        statusCode: 200,
        body: JSON.stringify({
            username,
            c,
            url:'https://d1ws6m51g9r6j7.cloudfront.net/'+c.Key
        }),
    }
}catch(e){
    console.log(e);
    return {
        statusCode: 500,
        body: JSON.stringify({
            username,
        }),
    }
}
}