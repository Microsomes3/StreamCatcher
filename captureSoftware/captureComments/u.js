const { manageUploadST } = require("./upload")

const fs = require("fs")

const params = {
    Bucket: "catchercomments",
    Key: "comment.mp4",
    Body: fs.createReadStream("video2.mp4"),
    ContentType: "video/mp4"
}

manageUploadST(params, "us-east-1").then((key) => {
    console.log(key)
})
