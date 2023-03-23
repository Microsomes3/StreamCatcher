
const { exec } = require("child_process");

async function getVideoRuntime(filePath) {
    try {
        console.log("getting runtime for", filePath);
      const { stdout } = await exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${filePath}`);
      const runtime = parseFloat(stdout);
      console.log(">",runtime)
      return runtime;
    } catch (error) {
      console.error(error);
      return null;
    }
  }


  module.exports = {
    getVideoRuntime
}