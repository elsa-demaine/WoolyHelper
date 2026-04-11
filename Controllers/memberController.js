const {
    CHANNEL_MEMBER_NAMES,
    CHANNEL_THEY_GONE,
    CHANNEL_IGN,
    MOD_ID,
    SS_ID,
    PH_ID
} = require('./../config.js');

function init(client) {
    // === LEAVES ===
    client.on('guildMemberRemove', async (member) => {
        console.log(`DEBUG: Member left: ${member.user.globalName}`);

        const channel = member.guild.channels.cache.get(CHANNEL_THEY_GONE);
        await channel.send(`💀 Left: ${member.user.globalName} | ${member.nickname || 'None'}`);
    });

    // === UPDATES ===
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        // Nickname change
        const oldNick = oldMember.nickname ?? null;
        const newNick = newMember.nickname ?? null;

        if (oldNick !== newNick) {
            const channel = newMember.guild.channels.cache.get(CHANNEL_MEMBER_NAMES);
            // Send ONLY the updated line
            await channel.send(`✏️ Updated: ${newMember.user.globalName} has updated from ${oldMember.nickname} to ${newMember.nickname || 'None'}`);
        }
    });

    // === MESSAGE COMMANDS ===
    client.on('messageCreate', async (message) => {
        if (message.channel.id !== CHANNEL_IGN) return; // ignore other channels

        const guild = client.guilds.cache.first();
        const member = guild.members.cache.get(message.author.id);
        console.log(member.roles.cache);

        if (member.roles.cache.has(MOD_ID)) { return; }
        if (member.roles.cache.has(SS_ID)) { return; }
        if (member.roles.cache.has(PH_ID)) { return; }

        const safenickname = message.content
            .slice(0, 200)             // size limit
            .replace(/[&<>"']/g, (c) => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
            }[c]));
        await member.setNickname(safenickname);
        await message.delete();
    })
};

module.exports = { init };