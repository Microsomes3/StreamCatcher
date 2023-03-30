const aws = require('aws-sdk');

function manageUploadST(params, region) {
    return new Promise((resolve, reject) => {
        const s3 = new aws.S3({
            region: region
        });

        const managedUpload = s3.upload(params);

        managedUpload.on('httpUploadProgress', function (progress) {
            console.log("Progress: " + progress.loaded + " / " + progress.total);
        });

        managedUpload.send(function (err, data) {

            if (err) {
                console.log("Error", err);
                reject(err);
            }

            if (data) {
                console.log("Upload Success", data.Location);
                resolve(data.Key);
            }

        });

    })
}




module.exports = {
    manageUploadST
}