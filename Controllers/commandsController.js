const errorController = require('./../errorHandler.js');

function init(client) {
    client.on('messageCreate', async (message) => {
        try {
            // works in all channels
            if (!message.content.startsWith(`!`)) return;

            const channel = message.guild.channels.cache.get(message.channel.id);

            const args = message.content.trim().split(/\s+/);
            const command = args.shift().toLowerCase();

            if (command === `!party`) {
                return channel.send(
                    `Please head to https://discord.com/channels/974030257432719381/1540450469338685571 for on the spot groups **or** check out the threads in https://discord.com/channels/974030257432719381/1551844878005051403!`
                );
            }
            else if (command ===`!fart`) {
                return channel.send('huehue I farded');
            }
            // !bonk
            else if (command === `!bonk`) {
                const target = message.mentions.users.first();
                const targetName = target ? target : args.join(` `);
                const targetText = targetName ? targetName : `you`;

                return channel.send({
                    content: `Wooly Helper gently bonks ${targetText} with a tiny mushroom. BONK! 🐑🍄`,
                    allowedMentions: { parse: [] }
                });
            }
            // !yeet
            else if (command === `!yeet`) {
                const target = message.mentions.channels.first();
                const targetChannel = target ? target : `the relevant channel for this topic`;

                return channel.send(`⚠️ Wooly Helper has detected a lost Shroom ⚠️\n\nBuckle your seatbelts, you're being launched to ${targetChannel} 🐑💨 Please continue your discussion over there`);
            }
            // !hug
            else if (command === `!hug`) {
                const target = message.mentions.users.first();
                const targetName = target ? target : args.join(` `);
                const targetText = targetName ? targetName : `you`;

                return channel.send({
                    content: `Wooly Helper wraps ${targetText} in the warmest, fluffiest sheep hug 🐑💚`,
                    allowedMentions: { parse: [] }
                });
            }
            // headpats
            else if (command === `!headpats`) {
                const target = message.mentions.users.first();
                const targetName = target ? target : args.join(` `);
                const targetText = targetName ? targetName : `you`;

                return channel.send({
                    content: `Wooly Helper gives ${targetText} some very gentle headpats 🐑✨`,
                    allowedMentions: { parse: [] }
                });
            }
        } catch (err) {
            await errorController.sendError(client, err);
        }
    })
}

module.exports = { init };