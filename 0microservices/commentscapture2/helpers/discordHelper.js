const { REST } = require('@discordjs/rest');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN || "MTA4NzUwNzU1Mzc2MTY0MDYxOQ.GUMKdI.WRFydAtdTz55IWqdHHZiOQ5uwez6W0J1CczG8E");

const channelId = process.env.DISCORD_CHANNEL_ID || "483635040610287619"  //shitpost channel id

async function sendShitpostLink(link) {
    await rest.post(`/channels/${channelId}/messages`, { body: { content: '(new system)-'+link } });
    return true;
}

async function sendToUser(link, user) {
    await rest.post(`/users/${user}/messages`, { body: { content: link } });
    return true;
}

module.exports = {
    sendShitpostLink,
    sendToUser
}