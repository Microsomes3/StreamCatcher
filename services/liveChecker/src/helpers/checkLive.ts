import { spawn } from 'child_process'


export function getLiveStatus(executatePath:string, username:string): Promise<any>{
    return new Promise((resolve,reject)=>{
        const formattedUrl = username.includes("@") ? `https://youtube.com/${username}/live` : `https://twitch.tv/${username}/live`;
        var ls = spawn(executatePath, ['-f', 'bestvideo[height<=?1080][vcodec^=avc1]+bestaudio/best', '-g', formattedUrl]);

        ls.stdout.on('data', (data) => {
            resolve(true);
        })

        ls.stderr.on('data', (data) => {
           resolve(false)
        })
    })
}