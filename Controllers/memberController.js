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
            // DisplayName change
            const oldName = oldMember.displayName ?? null;
            const newName = newMember.displayName ?? null;

            if (oldName !== newName) {
                const channel = newMember.guild.channels.cache.get(CHANNEL_MEMBER_NAMES);
                // Send ONLY the updated line
                await channel.send(`✏️ Updated: ${newMember.user.username} has updated from ${oldMember.displayName} to ${newMember.displayName}`);
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