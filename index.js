require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const errorController = require('./errorHandler.js');
const memberController = require('./Controllers/memberController.js');
const counting = require('./Controllers/countingController.js');
const channelController = require('./Controllers/channelController.js');
const majiController = require('./Controllers/majiController.js');
const slotsController = require('./Controllers/slotsController.js');
const partyQuestionnaireController = require('./Controllers/partyQuestionnaireController.js');

// === BOT SETUP ===
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,       
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: ['GUILD_MEMBER','MESSAGE', 'CHANNEL', 'REACTION'] // helps with update events
});

process.on('unhandledRejection', async (reason) => {
    console.error(reason);
    await errorController.sendError(client, reason);
});

process.on('uncaughtException', async (error) => {
    console.error(error);
    await errorController.sendError(client, error);
});

// === READY EVENT ===
client.once('clientReady', async () => {
    try {
        console.log(`Bot online: ${client.user.tag}`);
        const guild = client.guilds.cache.first();
        await guild.members.fetch();
        client.user.setActivity('Wool Growing Competition');
    } catch (err) {
        console.error(err);
        await errorController.sendError(client, err);
    }
});

client.on('interactionCreate', async (interaction) => {
    try {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'help') {
            const version = '1.2.0';
            await interaction.reply(`Hello! \nI am here to help TWJ with a couple of tasks;\n - Deleting old parties\n - Counting bot\n - !maji command\n - spinner\n - Party Thread pings\nIf you need more information please contact GummyMouton <3.\nVersion ${version}`);
        }
    } catch (err) {
        console.error(err);
        await errorController.sendError(client, err);
    }
});

try {
    // Pass client to controller
    memberController.init(client);
    counting.init(client);
    channelController.init(client);
    majiController.init(client);
    slotsController.init(client);
    partyQuestionnaireController.init(client);
} catch (err) {
    console.error(err);
    errorController.sendError(client, err);
}

client.login(process.env.TOKEN);