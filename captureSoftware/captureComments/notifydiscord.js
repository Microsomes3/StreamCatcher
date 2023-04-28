const {
    sendShitpostLink
} = require("./helpers/discordHelper")

const fs= require("fs")


var lastComment = null;

setInterval(()=>{

    try{
    const comments = JSON.parse(fs.readFileSync("comments4.json", "utf8"))
    const c = comments.allComments[comments.allComments.length - 1].comment
    const a = comments.allComments[comments.allComments.length - 1].author;


    if(lastComment == c){

    }else{
        sendShitpostLink(`(${a})- ${c}`)
        lastComment = c;
    }
}catch(e){
    console.log(e)
}

},10)

