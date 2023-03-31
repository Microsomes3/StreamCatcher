const { processDownload } = require('./helpers/processDownload')
const { manageUploadST } = require('./helpers/uploadHelper')
const moment = require('moment')
const fs = require('fs')
const { spawn, exec } = require('child_process');

// const xvfbProcess = spawn("Xvfb", [":99", "-screen", "0", "1024x768x16"]);
// xvfbProcess.stdout.on("data", (data) => {
//   console.log(`stdout: ${data}`);
// });
// xvfbProcess.stderr.on("data", (data) => {
//   console.error(`stderr: ${data}`);
// });
// xvfbProcess.on("close", (code) => {
//   console.log(`child process exited with code ${code}`);
// });



async function start() {

	try {
		console.log("downloading alex jones content");

		const { paths, status } = await processDownload({
			url: "https://banned.video/channel/the-alex-jones-show",
			timeout: 60000
		})

		console.log(">",paths,status)

		const current = moment().format("YYYY-MM-DD-HH-mm-ss");

		const params = {
			Bucket: "griffin-record-input",
			Body: fs.createReadStream(paths[0]),
			ContentType: "video/mp4",
			Key: `alex_${current}.mp4`
		};

		const loc = await manageUploadST(params);

		console.log(">",loc)



	} catch (err) {
		console.log(err);
	}
}

start();