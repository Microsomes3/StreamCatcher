"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToUser = exports.sendShitpostLink = void 0;
const rest_1 = require("@discordjs/rest");
const rest = new rest_1.REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
const channelId = process.env.DISCORD_CHANNEL_ID; //shitpost channel id
async function sendShitpostLink(link) {
    await rest.post(`/channels/${channelId}/messages`, { body: { content: '(new system)-' + link } });
    return true;
}
exports.sendShitpostLink = sendShitpostLink;
async function sendToUser(link, user) {
    await rest.post(`/users/${user}/messages`, { body: { content: link } });
    return true;
}
exports.sendToUser = sendToUser;
