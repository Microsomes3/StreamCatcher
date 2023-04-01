const aws = require('aws-sdk');
const { sendShitpostLink, sendToUser } = require('./helpers/discordHelper')

const s3 = new aws.S3({
    region: process.env.AWS_REGION_T,
});

module.exports.handler = async (event) => {

    const key = event.Records[0].s3.object.key;

    console.log(key);

    const newlink= `https://d213lwr54yo0m8.cloudfront.net/${key}`;

    //get content size
    const params = {
        Bucket: process.env.RECORD_BUCKET,
        Key: key,
    };

    // const data = await s3.getObject(params).promise();

    // const contentLength = data.ContentLength;
    // const inmb = contentLength / 1000000;

    //if key ends with .jpeg do not send to discord
    if (key.endsWith('.jpeg')) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                results: "Not a video",
            }),
        }
    }
    

   await sendShitpostLink(`- ${newlink}`);

   try{
    await sendToUser(`- ${newlink}`,"657753055118491649");
   }catch(e){}

//    console.log(newlink);
//    console.log(newlink);

    return {
        statusCode: 200,
        body: JSON.stringify({
            results: newlink,
        }),
    }
};