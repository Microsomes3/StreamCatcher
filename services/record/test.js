const { sendShitpostLink } = require('./helpers/discordHelper')


sendShitpostLink("https://google.com").then((res) => {
    console.log(res)
})