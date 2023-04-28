import { REST } from '@discordjs/rest'

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN as string);
const channelId = process.env.DISCORD_CHANNEL_ID  //shitpost channel id

export async function sendShitpostLink(link:string) {
    await rest.post(`/channels/${channelId}/messages`, { body: { content: '(new system)-'+link } });
    return true;
}

export async function sendToUser(link:string, user:string) {
    await rest.post(`/users/${user}/messages`, { body: { content: link } });
    return true;
}