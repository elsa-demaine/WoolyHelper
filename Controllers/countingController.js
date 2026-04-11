const {
    fs,
    CHANNEL_COUNTING,
    DATA_FILE
} = require('./../config.js');

function loadFile() {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
    return {};
}
function updateFile(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function init(client) {
    // === MESSAGE COMMANDS ===
    client.on('messageCreate', async (message) => {
        if (message.channel.id !== CHANNEL_COUNTING) return; // ignore other channels
        const channel = client.channels.cache.get(CHANNEL_COUNTING);

        const currentNumber = Number(message.content);
        if (!Number.isNaN(currentNumber) && Number.isInteger(currentNumber)) {

            // === Finding variables ===
            let data = loadFile();
            if (Object.keys(data).length === 0) {
                data = {
                    previousAuthorId: 0,
                    previousNumber: 0,
                    currentHighscore: 0,
                    savedUsedNumber: -101,
                };
                updateFile(data);
            }

            let previousMember;
            try {
                previousMember = await message.guild.members.fetch(data.previousAuthorId);
            } catch {
                previousMember = null;
            }

            // messages
            let nextNumber = `The next number is: ${data.previousNumber + 1} and can be sent by anyone other than ${previousMember?.displayName || previousMember?.globalName || 'Unknown'}.`;
            let sameAuthor = `You cannot count twice in a row and the save hasn't come back 😱 Start again at 1`;
            let savedUsed = `${message.author?.displayName || message.author?.globalName || 'Unknown'} used the save. ${nextNumber} The save will come back after the next 100 correct numbers`;
            let twice = `The number ${currentNumber} was sent twice in a row! ${nextNumber}`;
            let wrongNumber = `Wrong number and the save hasn't come back 😱 Start again at 1`;

            // === Checking numbers ===
            if (message.author.id === data.previousAuthorId && currentNumber > 1) {
                if (data.previousNumber - data.savedUsedNumber < 100) {
                    message.react("❌");
                    data.previousNumber = 0;
                    data.savedUsedNumber = -101;
                    message.reply(sameAuthor);
                } else {
                    message.react("💾");
                    data.savedUsedNumber = data.previousNumber;
                    channel.send(savedUsed);
                }
            } else if (currentNumber === data.previousNumber + 1) {
                if (currentNumber > data.currentHighscore) {
                    message.react("🏆");
                    data.previousAuthorId = message.author.id;
                    data.currentHighscore = currentNumber;
                    data.previousNumber = currentNumber;
                } else {
                    message.react("✅");
                    data.previousAuthorId = message.author.id;
                    data.previousNumber = currentNumber;
                }
                if (currentNumber.toFixed().endsWith("00")) {
                    message.react("💯");
                }
                else if (currentNumber.toFixed().endsWith("69")) {
                    message.react("🇳");
                    message.react("🇴");
                    message.react("🇮");
                    message.react("🇨");
                    message.react("🇪");
                }
            } else if (currentNumber === data.previousNumber) {
                message.react("⚠️");
                channel.send(twice);
            }
            else { //if (currentNumber > previousNumber + 1 || currentNumber < previousNumber) 
                if (data.previousNumber - data.savedUsedNumber < 100) {
                    message.react("❌");
                    data.previousNumber = 0;
                    data.savedUsedNumber = -101;
                    channel.send(wrongNumber);
                } else {
                    message.react("💾");
                    data.savedUsedNumber = data.previousNumber;
                    channel.send(savedUsed);
                }
            }

            updateFile(data);
        }
        else if (String(message.content).toUpperCase() === "RULES") {
            return channel.send('1) No skipping numbers \n2) No going back in numbers \n3) Must alternate counters \n4) Do not intentionally ruin the count');
        };
    });

    client.on('messageDelete', async (message) => {
        if (message.channel.id !== CHANNEL_COUNTING) return; // ignore other channels
        const channel = client.channels.cache.get(CHANNEL_COUNTING);

        if (message.partial) {
            try {
                message = await message.fetch();
            } catch (err) {
                console.log("Impossible to get message:", err);
                return;
            }
        }

        const currentNumber = Number(message.content);
        if (!Number.isNaN(currentNumber) && Number.isInteger(currentNumber)) {

            // === Finding variables ===
            let data = loadFile();
            if (Object.keys(data).length === 0) {
                data = {
                    previousAuthorId: 0,
                    previousNumber: 0,
                    currentHighscore: 0,
                    savedUsedNumber: -101,
                };
                updateFile(data);
            }

            let previousMember;
            let memberDeleted;

            try {
                previousMember = await message.guild.members.fetch(data.previousAuthorId);
            } catch {
                previousMember = null;
            }

            try {
                memberDeleted = await message.guild.members.fetch(message.author.id);
            } catch {
                memberDeleted = null;
            }

            let next = 'The next number is: 1 and can be sent by anyone';
            if (data.previousNumber > 0) {
                next = `The next number is: ${data.previousNumber + 1} and can be sent by anyone other than ${previousMember?.displayName || previousMember?.globalName || 'Unknown'}.`;
            }

            channel.send(`The number ${currentNumber} sent by ${memberDeleted?.displayName || memberDeleted?.globalName || 'Unknown'} has been deleted. ${next}`);
        }
    });
}

module.exports = { init };