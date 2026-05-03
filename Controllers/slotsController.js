const { createCanvas } = require('@napi-rs/canvas');
const GIFEncoder = require('gif-encoder-2');
const { AttachmentBuilder } = require('discord.js');

function init(client) {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'spin') {
            const participants = interaction.options.getString('participants');
            const nbWinners = interaction.options.getNumber('winners');

            let entries = participants.split(';');
            entries = entries.map(item => item.trim());
            let winners = [];

            if (entries.length < nbWinners) {
                await interaction.reply(`too many winners compared to participants count`);
            } else if (nbWinners > 10) {
                await interaction.reply(`too many winners: max 10`);
            }
            else {
                while (winners.length < nbWinners) {
                    const winner = entries[Math.floor(Math.random() * entries.length)];
                    if (winners.indexOf(winner) === -1) {
                        winners.push(winner);
                    }
                }

                const buffer = generateSlotGIF(entries, winners);

                const attachment = new AttachmentBuilder(buffer, { name: 'spin.gif' });

                await interaction.reply({
                    content: `🎉 Winner(s): **${winners.join(` | `)}**`,
                    files: [attachment]
                });
            }            
        }
    });
};

module.exports = { init };
function createReel(entries, loops) {
    const reel = [];

    for (let i = 0; i < loops; i++) {
        for (const entry of entries) {
            reel.push(entry);
        }
    }

    return reel;
}

function generateSlotGIF(entries, winners) {
    const reelWidth = 100;
    const width = winners.length * reelWidth;
    const height = 200;
    const itemHeight = 40;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const encoder = new GIFEncoder(width, height);
    encoder.start();
    encoder.setRepeat(0);

    const loops = 4; // number of visible full cycles
    const reel = createReel(entries, loops);

    const totalFrames = 60;
    
    for (let frame = 0; frame < totalFrames; frame++) {
        encoder.setDelay(50);

        const t = frame / (totalFrames - 1);
        const ease = 1 - Math.pow(1 - t, 5);

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "18px sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const centerY = height / 2;

        for (let w = 0; w < winners.length; w++) {

            let winnerIndex = (entries.length * (loops - 1)) + reel.indexOf(winners[w]);
            const scrollIndex = winnerIndex * ease;

            const start = Math.floor(scrollIndex - 2);
            const end = Math.ceil(scrollIndex + 2);

            const xOffset = (w * reelWidth) + reelWidth / 2;

            for (let i = start; i <= end; i++) {
                if (i < 0 || i >= reel.length) continue;

                const y = (i - scrollIndex) * itemHeight + centerY;

                const isCenter = Math.abs(y - centerY) < itemHeight / 2;

                ctx.fillStyle = isCenter ? '#ffd700' : '#ffffff';
                ctx.fillText(reel[i], xOffset, y);
            }
        }

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, centerY - itemHeight / 2, width, itemHeight);
        encoder.addFrame(ctx);
        //const imageData = ctx.getImageData(0, 0, width, height);
        //encoder.addFrame(imageData.data);
    }

    // HOLD FRAME (linger effect)
    for (let i = 0; i < 8; i++) {
        encoder.setDelay(200); // slower = pause
        encoder.addFrame(ctx);
    }

    encoder.finish();
    return encoder.out.getData();
}