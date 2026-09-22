const {
    WELCOME,
    MEMBER_NAMES,
    WELP_THEY_GONE,
    CONFIRM_YOUR_IGN,
    CHITTER_CHATTER,
    MOD,
    SHROOM_SUPPORT,
    SHROOMS,
    UNVERIFIED,
    BOTS,
    PLUSH_TRADE,
    PLUSH_COLLECTION
} = require('./../config.js');
const errorController = require('./../errorHandler.js');

const welcomeLock = new Set();

function init(client) {
    // === JOINS ===
    client.on('guildMemberAdd', async (member) => {
        try {
            await member.roles.add(UNVERIFIED);
            const channel = member.guild.channels.cache.get(WELCOME);
            await channel.send(`Hey ${member.user.username}, welcome to 𝐖𝐨𝐨𝐥𝐲 𝐉𝐮𝐦𝐩𝐞𝐫!\n\nPlease head to https://discord.com/channels/974030257432719381/1492542404270489871 to gain access to the full server, and take a minute to read the https://discord.com/channels/974030257432719381/1289221578562732184\n\nYou can also ⁠<id:customize> to receive notifications on your favourite events, introduce yourself in https://discord.com/channels/974030257432719381/1282611793595863150⁠, and learn more about the team in https://discord.com/channels/974030257432719381/1306904687064252450\n\nWe're happy to have you here and hope you enjoy your stay on our cozy side of the internet <:wooly_heart:1542543447855202384>`);
        } catch (err) {
            await errorController.sendError(client, err);
        }
    });

    // === LEAVES ===
    client.on('guildMemberRemove', async (member) => {
        try {
            const channel = member.guild.channels.cache.get(WELP_THEY_GONE);
            await channel.send(`💀 Left: ${member.user.username} | ${member.displayName || member.nickname || 'None'}`);
        } catch (err) {
            await errorController.sendError(client, err);
        }
    });

    // === UPDATES ===
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        try {
            // doesn't seem to work with displayname
            const nicknameChanged = oldMember.nickname !== newMember.nickname;

            if (nicknameChanged) {
                const channel = newMember.guild.channels.cache.get(MEMBER_NAMES);
                // Send ONLY the updated line
                await channel.send(`✏️ Updated: ${newMember.user.username} has updated from ${oldMember.nickname ?? oldMember.user.displayName ?? 'None'} to ${newMember.nickname ?? 'None'}`);
            }
        } catch (err) {
            await errorController.sendError(client, err);
        }

        try {
            const newShroom = !oldMember.roles.cache.has(SHROOMS) && newMember.roles.cache.has(SHROOMS)

            if (newShroom) {

                if (welcomeLock.has(newMember.id)) {
                    return;
                }

                welcomeLock.add(newMember.id);

                if (oldMember.user.username === 'smolcrisp') {
                    const channel = newMember.guild.channels.cache.get(MEMBER_NAMES);
                    await channel.send(`Bad Smol! Stop removing your Shrooms role!`);
                } else {
                    const channel = newMember.guild.channels.cache.get(CHITTER_CHATTER);

                    const messagesList = [
                        `The grove grows bigger thanks to <@${newMember.user.id}> <:xCuteMushy:1458225626350878894> Welcome in!`,
                        `<@${newMember.user.id}> has arrived in our cosy corner <:wooly_heart:1542543447855202384>  Welcome in!`,
                        `A new shroom popped up! Our field keeps growing 🍄 Welcome in <@${newMember.user.id}>!`,
                        `A wild <@${newMember.user.id}> has appeared <:wooly_awe:1542546113020825640> Welcome in!`,
                        `With a dash of magic and a sprinkle of fun <@${newMember.user.id}> has appeared :magic_wand: Welcome in!`,
                        `A lil' lamb has joined our flock 🐑 Welcome in <@${newMember.user.id}>!`
                    ];
                    const chosenMessage = messagesList[Math.floor(Math.random() * messagesList.length)];
                    await channel.send(chosenMessage);
                }
            }
        } catch (err) {
            await errorController.sendError(client, err);
            setTimeout(() => {
                welcomeLock.delete(newMember.id);
            }, 10000);
        }
    });

    // === MESSAGE COMMANDS ===
    client.on('messageCreate', async (message) => {
        try {
            if (message.channel.id === CONFIRM_YOUR_IGN) {
                const member = await message.guild.members.fetch(message.author.id);

                if (member.roles.cache.has(MOD)) return;
                if (member.roles.cache.has(SHROOM_SUPPORT)) return;
                if (member.roles.cache.has(BOTS)) return;

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
                await member.roles.add(SHROOMS);
                await member.roles.remove(UNVERIFIED);

                await message.delete();
            }
        } catch (err) {
            await errorController.sendError(client, err);
        }
    });

    // === THREADS ===
    client.on('threadMembersUpdate', async (addedMembers, removedMembers, thread) => {
        try {
            // Only handle the Plush Trade thread
            if (thread.id !== PLUSH_TRADE) return;

            // Members who joined
            for (const member of addedMembers.values()) {
                const guildMember = await thread.guild.members.fetch(member.id);

                if (!guildMember.roles.cache.has(PLUSH_COLLECTION)) {
                    await guildMember.roles.add(PLUSH_COLLECTION);
                }
            }

            // Members who left
            for (const member of removedMembers.values()) {
                const guildMember = await thread.guild.members.fetch(member.id);

                if (guildMember.roles.cache.has(PLUSH_COLLECTION)) {
                    await guildMember.roles.remove(PLUSH_COLLECTION);
                }
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
                    if (!member.roles.cache.has(SHROOMS) && !member.roles.cache.has(BOTS)) {
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