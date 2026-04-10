// Deploy commands.js
new SlashCommandBuilder()
    .setName('list')
    .setDescription('List all server members discord name & nickname'),
    /*.addChannelOption((option) => option
        .setName('channel')
        .setDescription('Channel in which to write the list')
        .addChannelTypes(ChannelType.GuildText)*/

    new SlashCommandBuilder()
        .setName('check')
        .setDescription('Will verify everyone is on the list and update it'),

// ============================================
function botReacted(msg, emoji, client) {
    const reaction = msg.reactions.cache.get(emoji);
    return reaction && reaction.users.cache.has(client.user.id);
}
// ============================================

const MAX_MESSAGE_LENGTH = 1900; // safe under Discord's 2000 char limit
const DATA_FILE = './members.json';
// Load stored members
let membersData = {};

// === DATA HANDLING ===
// Split text into chunks under MAX_MESSAGE_LENGTH
function chunkMessage(text) {
    const chunks = [];
    let remaining = text;
    while (remaining.length > MAX_MESSAGE_LENGTH) {
        let splitIndex = remaining.lastIndexOf('\n', MAX_MESSAGE_LENGTH);
        if (splitIndex === -1) splitIndex = MAX_MESSAGE_LENGTH;
        chunks.push(remaining.slice(0, splitIndex));
        remaining = remaining.slice(splitIndex + 1);
    }
    if (remaining.length > 0) chunks.push(remaining);
    return chunks;
}

function loadMembersFromFile() {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE));
    }
    return {};
}
function updateMembersInFile(members) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2));
}
function formatMembers(members) {
    return Object.entries(members)
        .map(([id, data]) => `${data.username} | ${data.nickname || 'None'}`)
        .join('\n');
}

// Post list in channel
async function postMemberList(members, channel) {
    const text = '**Current Members:**\n' + formatMembers(members);
    const chunks = chunkMessage(text);
    for (const chunk of chunks) {
        await channel.send(chunk);
    }
}

async function listCommand(guild, channel) {
    // Ensure we have all members
    await guild.members.fetch();

    // Add any new members not in the data
    guild.members.cache.forEach(member => {
        if (!membersData[member.id]) {
            membersData[member.id] = {
                username: member.user.username,
                nickname: member.nickname || null
            };
        }
    });

    updateMembersInFile(membersData);

    await postMemberList(membersData, channel);
    console.log('DEBUG: Member list posted via /list');
}

membersData = loadMembersFromFile();

// === LEAVES ===
// Check if member exists in stored data
if (membersData[member.id]) {
    delete membersData[member.id]; // remove from file
    updateMembersInFile(membersData);

    console.log(`DEBUG: Removed ${member.user.tag} from members.json`);
}

// === JOINS ===
client.on('guildMemberAdd', async (member) => {
    console.log(`DEBUG: New member joined: ${member.user.tag}`);
    membersData[member.id] = {
        username: member.user.username,
        nickname: member.nickname || null
    };

    const channel = member.guild.channels.cache.get(CHANNEL_MEMBER_NAMES);
    if (channel) {
        await channel.send(
            `⭐ New: ${member.user.username} | ${member.nickname || 'None'}`
        );
        console.log(`DEBUG: Posted message after new member`);
    }
});

//=============================

//const channel = interaction.options.getChannel('channel');
//console.log(interaction.options.data);
//console.log(`DEBUG: Received message from ${message.author.tag}: "${message.content}"`);

//if (!message.guild) return; // ignore DMs
const channel = message.guild.channels.cache.get(CHANNEL_COUNTING);
if (!channel) {
    console.log('ERROR: Channel not found. Check CHANNEL_COUNTING.');
    return;
}


// Fetch recent messages
const fetched = await message.channel.messages.fetch(); // 100 limit

// Convert to array (newest → oldest)
const msgs = Array.from(fetched.values());

for (const msg of msgs) {
    if (
        msg.id !== message.id &&
        (
            botReacted(msg, "✅", client) ||
            botReacted(msg, "🏆", client)
        )
    ) {
        previousNumber = parseInt(msg.content);
        previousAuthor = msg.author;
        break;
    }
    if (botReacted(msg, "❌", client)) {
        break;
    }
}
console.log(previousAuthor);

// === HIGHSCORE (🏆 exists anywhere) ===
let highestNumber = 0;
for (const msg of msgs) {
    if (botReacted(msg, "🏆", client)) {
        const num = parseInt(msg.content);
        if (!isNaN(num) && num > highestNumber) {
            highestNumber = num;
        }
    }
}

// === LAST SAVE (💾) ===
let savedUsed = false;
for (const msg of msgs) {
    if (botReacted(msg, "💾", client)) {
        const saveNumber = parseInt(msg.content);

        if (!isNaN(saveNumber) && previousNumber - saveNumber < 100) {
            savedUsed = true;
        }
        break;
    }
}


client.on('messageDelete', (msg) => { // messagedelete is the event which gets triggered if somebody deletes a discord textmessage
    const embed = new Discord.RichEmbed() // Create a new RichEmbed
        .setColor('RED')
        .setTimestamp()
        .setFooter(`ID: ${msg.id}`)
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL)
        .setTitle(`Message deleted in #${msg.channel.name}`)
        .setDescription(msg.cleanContent);

    message.channel.find((r) => r.name.toLowerCase() === 'name of the channel where you want to send it. Be careful, the name has to be lowercase').send({ // Send the embed to the defined channel
        embed
    });

    // === COMMANDES ===
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'list') {
            const guild = client.guilds.cache.first();
            const channel = guild.channels.cache.get(CHANNEL_MEMBER_NAMES);

            listCommand(guild, channel);
            await interaction.reply(`Listing members... in  ${channel.name}`);
        }
    });


/*guild.channels.cache.forEach(c => {
    if (c.parentId) {
        console.log(
            `Channel: ${c.name}`,
            `parentId: ${c.parentId}`,
            `match: ${c.parentId === categoryId}`
        );
        console.log(`"${c.parentId}" === "${categoryId}"`);
    }
});*/
