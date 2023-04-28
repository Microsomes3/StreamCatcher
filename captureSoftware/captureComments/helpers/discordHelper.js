const { REST } = require('@discordjs/rest');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

const channelId = process.env.DISCORD_CHANNEL_ID //shitpost channel id

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