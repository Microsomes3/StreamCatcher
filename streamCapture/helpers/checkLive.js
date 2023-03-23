const axios = require('axios');

function mustCheckLive(channel) {

    const getChannelStatusURI = process.env.getChannelStatusURI || "https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/getLiveStatus/";

    return new Promise(async (resolve, reject) => {
        var maxTries = 3;
        var currentTry = 0;

        var toReturn = false;

        for (var i = 0; i < maxTries; i++) {

            try {
                const isLive = await axios.get(getChannelStatusURI + channel);
                toReturn = isLive.data;
                break;
            } catch (e) {
                console.log(e);
            }

            currentTry++;

        }

        resolve(toReturn)


    })
}

module.exports = {
    mustCheckLive
}