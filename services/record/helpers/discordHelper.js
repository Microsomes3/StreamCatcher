const { REST } = require('@discordjs/rest');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN || "NDk5NjQ4MjkzMzA4MDcxOTQ2.D2j61w.mb6U9AmIuVJZyk0zNiblJPUrl48");

const channelId = process.env.DISCORD_CHANNEL_ID || "483635040610287619" //shitpost channel id

async function sendShitpostLink(link) {
    await rest.post(`/channels/${channelId}/messages`, { body: { content: '(new system)-'+link } });
    return true;
}


module.exports = {
    sendShitpostLink,
}