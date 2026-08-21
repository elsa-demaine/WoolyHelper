const { EmbedBuilder } = require('discord.js');
const {
    TWJ_EVENTS_ID,
    PARTY_PLANNER_ID,
    DECOR_COMP_ID,
    PALIA_LFG,
    SHROOM_EVENTS
} = require('./../config.js');
const errorController = require('./../errorHandler.js');

async function CheckParties(client, guild, categoryId) {
    const channels = guild.channels.cache.filter(
        c => c.parentId === categoryId
    );

    channels.forEach(async (chan) => {
        try {
            if (!(chan.id === PARTY_PLANNER_ID || chan.id === DECOR_COMP_ID)) {
                if (isExpired(chan) && await isInactive(chan, 24)) {
                    await chan.delete();
                }
            }
        } catch (err) {
            await errorController.sendError(client, err);
        }
    })  
};

function isExpired(channel) {
    const now = new Date();
    const regex = /^[^-]+-(\d{1,2})-([a-z]{3})/i;
    const match = channel.match(regex);
    const day = (match[1]) + 1;
    const month = (match[2]);
    let nMonth;

    if (month === 'jan') {
        nMonth = 0;
    } else if (month === 'feb') {
        nMonth = 1;
    } else if (month === 'mar') {
        nMonth = 2;
    } else if (month === 'apr') {
        nMonth = 3;
    } else if (month === 'may') {
        nMonth = 4;
    } else if (month === 'jun') {
        nMonth = 5;
    } else if (month === 'jul') {
        nMonth = 6;
    } else if (month === 'aug') {
        nMonth = 7;
    } else if (month === 'sep') {
        nMonth = 8;
    } else if (month === 'oct') {
        nMonth = 9;
    } else if (month === 'nov') {
        nMonth = 10;
    } else { //dec
        nMonth = 11;
    }

    const chanTime = new Date(now.getFullYear(), nMonth, day);

    return now > chanTime;
};

async function isInactive(channel, hours) {
    const lastMessage = await channel.messages.fetch({ limit: 1 }).then(msgs => msgs.first());
    const now = new Date();
    const isHours = new Date(new Date(lastMessage.createdAt).getTime() + 60 * 60 * hours * 1000);
    return now > isHours;
};

function init(client) {
    client.once('clientReady', () => {
        setInterval(async () => {
            try {
                const guild = client.guilds.cache.first();
                CheckParties(client, guild, TWJ_EVENTS_ID);
            } catch (err) {
                await errorController.sendError(client, err);
            }
        }, 2 * 60 * 60 * 1000); // 2 hours (hour * minute * seconds * milliseconds)
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'cleanup') {
            try {
                await interaction.deferReply({ content: "Sweeping..." });
                const guild = client.guilds.cache.first();
                CheckParties(client, guild, TWJ_EVENTS_ID);
                return await interaction.editReply(`All cleaned!`);
            } catch (err) {
                await errorController.sendError(client, err);
            }
        };
    })

    // === MESSAGE COMMANDS ===
    const reminderTimers = new Map();
    const reminderMessages = new Map();

    client.on('messageCreate', async (message) => {
        try {
            if (message.author.bot) return;

            const channelId = message.channel.id;

            if (channelId === PALIA_LFG) {
                // Cancel the previous timer for this channel
                if (reminderTimers.has(channelId)) {
                    clearTimeout(reminderTimers.get(channelId));
                }

                // Start a new 10-second timer
                const timer = setTimeout(async () => {

                    // Delete the previous reminder
                    const oldMessage = reminderMessages.get(channelId);

                    if (oldMessage) {
                        try {
                            await oldMessage.delete();
                        } catch (error) {
                            await errorController.sendError(client, error);
                        }
                    }

                    // Send the new reminder
                    const embedMessage = new EmbedBuilder()
                        .setColor(0xb76bd7)
                        .setTitle('Looking for group')
                        .setDescription(`Hey, Shroomie! Use this channel to organise on the spot party up's! You can use @Shroom Search to notify other Shrooms`);

                    const newMessage = await message.channel.send({
                        embeds: [embedMessage],
                        allowedMentions: { parse: [] }
                    });

                    // Remember it so we can delete it next time
                    reminderMessages.set(channelId, newMessage);

                    reminderTimers.delete(channelId);

                }, 10000);

                reminderTimers.set(channelId, timer);
            }
            else if (channelId === SHROOM_EVENTS) {
                // Cancel the previous timer for this channel
                if (reminderTimers.has(channelId)) {
                    clearTimeout(reminderTimers.get(channelId));
                }

                // Start a new 10-second timer
                const timer = setTimeout(async () => {

                    // Delete the previous reminder
                    const oldMessage = reminderMessages.get(channelId);

                    if (oldMessage) {
                        try {
                            await oldMessage.delete();
                        } catch (error) {
                            await errorController.sendError(client, error);
                        }
                    }

                    // Send the new reminder
                    const embedMessage = new EmbedBuilder()
                        .setColor(0xc27c0e)
                        .setTitle('Shroom Events')
                        .setDescription(`Hey, Shroomie! Use this channel to post scheduled parties you're hosting! You can use @Shroom Event to notify other Shrooms`);

                    const newMessage = await message.channel.send({
                        embeds: [embedMessage],
                        allowedMentions: { parse: [] }
                    });

                    // Remember it so we can delete it next time
                    reminderMessages.set(channelId, newMessage);

                    reminderTimers.delete(channelId);

                }, 10000);

                reminderTimers.set(channelId, timer);
            }
        } catch (err) {
            await errorController.sendError(client, err);
        }
    });
};

module.exports = { init };
