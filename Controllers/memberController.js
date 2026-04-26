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
            await channel.send(`💀 Left: ${member.user.username} | ${member.displayName || member.nickname || 'None'}`);
        } catch (err) {
            console.error(err);
            await errorController.sendError(client, err);
        }
    });

    // === UPDATES ===
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        try {
            // doesn't seem to work with displayname
            const oldNick = oldMember.nickname ?? null;
            const newNick = newMember.nickname ?? null;

            if (oldNick !== newNick) {
                const channel = newMember.guild.channels.cache.get(CHANNEL_MEMBER_NAMES);
                // Send ONLY the updated line
                await channel.send(`✏️ Updated: ${newMember.user.username} has updated from ${oldMember.nickname ?? 'None'} to ${newMember.nickname ?? 'None'}`);
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

            const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
            await channel.send(`DEBUG: ${member.user.username} (${member.user.nickname} / ${member.user.displayName}) has written ${message.content}`);

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