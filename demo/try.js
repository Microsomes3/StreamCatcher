const { spawn, exec } = require('child_process');


const url = "https://youtube.com/@CreepsMcPasta/live";
const outputFile = "output.mp4";

const child = spawn('yt-dlp', ['--live-from-start', '--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4', '-o', outputFile, url]);

child.stdout.on('data', (data) => {
  console.log(`yt-dlp stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`yt-dlp stderr: ${data}`);
});

setTimeout(() => {
  console.log('Sending SIGINT signal');
  child.kill('SIGINT');
}, 5000);


  process.on('SIGINT', () => {
    console.log('Received SIGINT signal');
    child.kill('SIGINT');
  });