const {
    GUMMY_BOT_BUILD_ID,
    GUMMY_ID
} = require('./config.js');

async function sendError(client, error) {
    try {
        const errorMessage = (error.stack || error.toString()).slice(0, 1900);
        sendErrorToChannel(client, errorMessage);
        sendErrorDM(client, errorMessage);
    } catch (err) {
        console.error("Failed to send error:", err);
    }
}

async function sendErrorToChannel(client, errorMessage) {
    try {
        const channel = await client.channels.fetch(GUMMY_BOT_BUILD_ID);

        if (!channel) return;

        await channel.send(errorMessage);
    } catch (err) {
        console.error("Failed to send error to channel:", err);
    }
}

async function sendErrorDM(client, errorMessage) {
    try {
        const user = await client.users.fetch(GUMMY_ID);
        await user.send(errorMessage);
    } catch (err) {
        console.error("Failed to send DM:", err);
    }
}

module.exports = {
    sendError
};