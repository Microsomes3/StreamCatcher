const { spawn } = require("child_process");

// Start Xvfb
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


const { checkMultiLive } = require('./helpers/checkLive')


checkMultiLive([
    "@CreepsMcPasta"
]).then((data) => {
    console.log(data);
})