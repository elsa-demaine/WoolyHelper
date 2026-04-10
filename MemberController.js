// === CONFIG ===
const CHANNEL_MEMBER_NAMES = '1489710392212062218';
const CHANNEL_THEY_GONE = '1353695719265009705';
const CHANNEL_IGN = '0'; // 1490226018290765934 = gummy bot build
const MOD_ID = '1296388640213045290'; // Mods
const SS_ID = '1376457228491690004'; // Shroom Support
const PH_ID = '1317588561410658495'; // Party Hosts


function init(client) {
    // === LEAVES ===
    client.on('guildMemberRemove', async (member) => {
        console.log(`DEBUG: Member left: ${member.user.globalName}`);

        const channel = member.guild.channels.cache.get(CHANNEL_THEY_GONE);
        await channel.send(`💀 Left: ${member.user.globalName} | ${member.nickname || 'None'}`);
    });

    // === UPDATES ===
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        // New member
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));

        if (addedRoles.size > 0) {
            console.log(`GN: ${newMember.user.globalName} got roles from onboarding:`);
            console.log(`DN: ${newMember.user.displayName} got roles from onboarding:`);
            console.log(`NN: ${newMember.user.nickName} got roles from onboarding:`);

            if (newMember.user.globalName === 'sideway_scissors' || newMember.user.displayName === 'sideway_scissors') {
                await channel.send(`⚠️: ${newMember.user.globalName} wanting to join is on the No No Names!`);
            }
        }

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