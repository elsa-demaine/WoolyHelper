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
            const channelLogs = member.guild.channels.cache.get(LOG_CHANNEL_ID);
            await channelLogs.send(`DEBUG: Member left username: ${member.user.username}`);
            await channelLogs.send(`DEBUG: Member left nickname: ${member.nickname}`);
            await channelLogs.send(`DEBUG: Member left displayName: ${member.displayName}`);

            const channel = member.guild.channels.cache.get(CHANNEL_THEY_GONE);
            await channel.send(`💀 Left: ${member.user.username} | ${member.nickname || 'None'}`);
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

            const channel = member.guild.channels.cache.get(CHANNEL_MEMBER_NAMES);
            // Send ONLY the updated line
            await channel.send(`✏️ Updated: ${member.user.username} has updated from ${member.nickname} to ${member.safenickname}`);

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