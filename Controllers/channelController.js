const { EmbedBuilder } = require('discord.js');
const {
    PALIA_LFG,
    SCHEDULED_PARTIES
} = require('./../config.js');
const errorController = require('./../errorHandler.js');

async function CheckParties(client, guild) {
    const sch_parties = guild.channels.cache.get(SCHEDULED_PARTIES);

    sch_parties.threads.cache.forEach(async (thread) => {
        try {
            if (await isInactive(thread, 336)) { // 336 = 2 weeks
                thread.delete();
            }
        } catch (err) {
            await errorController.sendError(client, err);
        }
    });
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
                CheckParties(client, guild);
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
                CheckParties(client, guild);
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
                        .setDescription(`Hey! Use this channel for when you're adventuring and want to party up right now! You can use @Shroom Search to notify other Shrooms <:wooly_search:1542552078327615530>\n--\nIf you are planning to host an event or party at a scheduled time, please use https://discord.com/channels/974030257432719381/1551844878005051403 <:wooly_party:1542547938323075104>`);

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
