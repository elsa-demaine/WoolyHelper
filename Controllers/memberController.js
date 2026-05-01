const {
    LOG_CHANNEL_ID,
    CHANNEL_MEMBER_NAMES,
    CHANNEL_THEY_GONE,
    CHANNEL_IGN,
    CHITTER_CHATTER_ID,
    MOD_ID,
    SS_ID,
    PH_ID,
    SHROOMS_ID,
    BOTS_ID
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
                await channel.send(`✏️ Updated: ${newMember.user.username} has updated from ${oldMember.user.displayName ?? oldMember.nickname ?? 'None'} to ${newMember.nickname ?? 'None'}`);
            }

            const isOldShroom = oldMember.roles.cache.has(SHROOMS_ID);
            const isNewShroom = newMember.roles.cache.has(SHROOMS_ID);
            if (isOldShroom === false && isNewShroom === true) {
                if (oldMember.user.username === 'smolcrisp') {
                    const channel = newMember.guild.channels.cache.get(CHANNEL_MEMBER_NAMES);
                    await channel.send(`Bad Smol! Stop removing your Shrooms role!`);
                } else {
                    //const channel = newMember.guild.channels.cache.get(CHITTER_CHATTER_ID);
                    const channel = newMember.guild.channels.cache.get(LOG_CHANNEL_ID);
                    const messagesList = [
                        `Welcome to the discord <@${newMember.user.id}>`,
                        `Welcome to the grove <@${newMember.user.id}>`
                    ];
                    const chosenMessage = messagesList[Math.floor(Math.random() * messagesList.length)];
                    await channel.send(`${chosenMessage}`);
                }
            }
        } catch (err) {
            console.error(err);
            await errorController.sendError(client, err);
        }
    });

    // === MESSAGE COMMANDS ===
    client.on('messageCreate', async (message) => {
        try {
            if (message.channel.id === CHANNEL_IGN) {
                const guild = client.guilds.cache.first();
                const member = guild.members.cache.get(message.author.id);

                const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
                await channel.send(`DEBUG: ${member.user.username} (${member.user.displayName}) has written ${message.content}`);

                if (member.roles.cache.has(MOD_ID)) return;
                if (member.roles.cache.has(SS_ID)) return;
                if (member.roles.cache.has(PH_ID)) return;

                const safenickname = message.content
                    .slice(0, 200)             // size limit
                    .replace(/[&<>"']/g, (c) => ({
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#39;'
                    }[c]));

                await member.setNickname(safenickname);
                await member.roles.add(SHROOMS_ID);
                await message.delete();
            }
        } catch (err) {
            await errorController.sendError(client, err);
        }
    });

    // === SLASH COMMANDS ===
    client.on('interactionCreate', async (interaction) => {
        try {
            if (!interaction.isChatInputCommand()) return;

            if (interaction.commandName === 'non-shrooms') {
                const guild = interaction.guild;

                // Ensure we have all members
                await guild.members.fetch();
                const members = [];

                guild.members.cache.forEach(member => {
                    if (!member.roles.cache.has(SHROOMS_ID) && !member.roles.cache.has(BOTS_ID)) {
                        members.push(member);
                    }
                });

                await interaction.reply({
                    content: `Non Shrooms:\n${formatMembers(members)}`
                });
            }
        } catch (err) {
            await errorController.sendError(client, err);
        }
    });
};

module.exports = { init };

function formatMembers(members) {
    return members
        .map(member => `${member.user.username} | ${member.user.displayName || 'None'}`)
        .join('\n');
};