const { REST, Routes, SlashCommandBuilder, ChannelType } = require('discord.js');

// 🔧 CONFIG
const TOKEN = 'TOKEN';
const CLIENT_ID = 'CLIENTID'; // from Developer Portal
const GUILD_ID = '974030257432719381';  // your test server

// Define commands
const commands = [
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all of Wooly Helpers commands')
].map(cmd => cmd.toJSON());

// Register
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log('✅ Commands registered!');
    } catch (error) {
        console.error(error);
    }
})();