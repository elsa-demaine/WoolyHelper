require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const memberController = require('./MemberController.js');
const counting = require('./Counting.js');
const channelController = require('./ChannelController.js');


// === BOT SETUP ===
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // Access to guilds
        GatewayIntentBits.GuildMembers,     // Access to members
        GatewayIntentBits.GuildMessages,    // Access to messages
        GatewayIntentBits.MessageContent    // Access to message content
    ],
    partials: ['GUILD_MEMBER','MESSAGE', 'CHANNEL', 'REACTION'] // helps with update events
});

// === READY EVENT ===
client.once('clientReady', async () => {
    console.log(`Bot online: ${client.user.tag}`);
    //const guild = client.guilds.cache.first();
    //await guild.members.fetch();
    client.user.setActivity('Wool Growing Competition');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'help') {
        await interaction.reply('Wooly Helper has /help commands');
    }
});

// Pass client to controller
memberController.init(client);
counting.init(client);
channelController.init(client);

client.login(process.env.TOKEN);