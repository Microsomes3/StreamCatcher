const aws = require('aws-sdk');
const { sendShitpostLink } = require('./helpers/discordHelper')

module.exports.handler = async (event) => {

    const key = event.Records[0].s3.object.key;
    const newlink= `https://d213lwr54yo0m8.cloudfront.net/${key}`;

   await sendShitpostLink(newlink);

   console.log(newlink);
   console.log(newlink);

    return {
        statusCode: 200,
        body: JSON.stringify({
            results: newlink,
        }),
    }
};