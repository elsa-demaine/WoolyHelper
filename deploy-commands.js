const { REST, Routes, SlashCommandBuilder, ChannelType } = require('discord.js');

// CONFIG
const TOKEN = 'TOKEN';
const CLIENT_ID = 'CLIENT_ID'; // from Developer Portal
const GUILD_ID = '974030257432719381';

// Define commands
const commands = [
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all of Wooly Helpers commands'),
    new SlashCommandBuilder()
        .setName('non-shrooms')
        .setDescription('List all server members who do not have the Shrooms role'),
    new SlashCommandBuilder()
        .setName('spin')
        .setDescription('Spin a list of names to find a winner')
        .addStringOption((option) => option
            .setName('participants')
            .setDescription('list of names separated by ; ')
            .setRequired(true))
        .addNumberOption((option) => option
            .setName('winners')
            .setDescription('number of winners (default = 1: max = 10)'))
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