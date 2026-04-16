const {
    LOG_CHANNEL_ID,
    CHANNEL_MEMBER_NAMES,
    CHANNEL_THEY_GONE,
    CHANNEL_IGN,
    MOD_ID,
    SS_ID,
    PH_ID,
    SHROOMS_ID
} = require('./../config.js');
const errorController = require('./../errorHandler.js');

function init(client) {
    // === LEAVES ===
    client.on('guildMemberRemove', async (member) => {
        try {
            const channel = member.guild.channels.cache.get(CHANNEL_THEY_GONE);
            await channel.send(`💀 Left: ${member.user.username} | ${member.nickname || member.displayName || 'None'}`);
        } catch (err) {
            console.error(err);
            await errorController.sendError(client, err);
        }
    });

    // === UPDATES ===
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        try {
            // Nickname change
            const oldNick = oldMember.nickname ?? null;
            const newNick = newMember.nickname ?? null;

            if (oldNick !== newNick) {
                const channelLogs = oldMember.guild.channels.cache.get(LOG_CHANNEL_ID);
                await channelLogs.send(`DEBUG: nickname old username: ${oldMember.user.username}`);
                await channelLogs.send(`DEBUG: nickname old nickname: ${oldMember.nickname}`);
                await channelLogs.send(`DEBUG: nickname old displayName: ${oldMember.displayName}`);
                await channelLogs.send(`DEBUG: nickname old globalName: ${oldMember.globalName}`);
                await channelLogs.send(`DEBUG: nickname new username: ${newMember.user.username}`);
                await channelLogs.send(`DEBUG: nickname new nickname: ${newMember.nickname}`);
                await channelLogs.send(`DEBUG: nickname new displayName: ${newMember.displayName}`);
                await channelLogs.send(`DEBUG: nickname new globalName: ${newMember.globalName}`);
                await channelLogs.send(`DEBUG: nickname ver old / new: ${oldNick} / ${newNick}`);

                const channel = newMember.guild.channels.cache.get(CHANNEL_MEMBER_NAMES);
                // Send ONLY the updated line
                await channel.send(`✏️ Updated: ${newMember.user.username} has updated from ${oldMember.displayName} to ${newMember.displayName || 'None'}`);
            }
        } catch (err) {
            console.error(err);
            await errorController.sendError(client, err);
        }
    });

    // === MESSAGE COMMANDS ===
    client.on('messageCreate', async (message) => {
        try {
            if (message.channel.id !== CHANNEL_IGN) return; // ignore other channels

            const guild = client.guilds.cache.first();
            const member = guild.members.cache.get(message.author.id);

            if (member.roles.cache.has(MOD_ID)) return;
            if (member.roles.cache.has(SS_ID)) return;
            if (member.roles.cache.has(PH_ID)) return;

            const safenickname = message.content
                .slice(0, 200)             // size limit
                .replace(/[&<>"']/g, (c) => ({
                    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
                }[c]));

            await member.setNickname(safenickname);
            await member.roles.add(SHROOMS_ID);
            await message.delete();
        } catch (err) {
            console.error(err);
            await errorController.sendError(client, err);
        }
    })
};

module.exports = { init };