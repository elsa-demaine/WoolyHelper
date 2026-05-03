const {
    PARTY_UP_ID,
    L4G_ID,
    EXTERNAL_PARTIES_ID,
    PALIA_GENERAL_CHAT_ID
} = require('./../config.js');
const errorController = require('./../errorHandler.js');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

function init(client) {
    const partyMap = {
        party_lfg: { role: L4G_ID, text: "looking for a group!" },
        party_cooking: { role: EXTERNAL_PARTIES_ID, text: "external cooking party!" },
        party_hunting: { role: EXTERNAL_PARTIES_ID, text: "external hunting party!" },
        party_bugging: { role: EXTERNAL_PARTIES_ID, text: "external bugging party" },
        party_mining: { role: EXTERNAL_PARTIES_ID, text: "external mining party!" },
        party_fishing: { role: EXTERNAL_PARTIES_ID, text: "external fishing party!" },
        party_foraging: { role: EXTERNAL_PARTIES_ID, text: "external foraging party!" }
    };

    client.on('threadCreate', async (thread) => {
        try {
            //private thread
            if (!thread.isThread()) return;
            //Not created in Party up
            if (thread.parentId !== PARTY_UP_ID) return;

            setTimeout(async () => {

                const row1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("party_lfg")
                        .setLabel("Nothing, just looking for a group")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("🔎"),
                    new ButtonBuilder()
                        .setCustomId("party_cooking")
                        .setLabel("Cooking Party")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:palia_Currency_Cooking:1461568602993066088>"),
                    new ButtonBuilder()
                        .setCustomId("party_hunting")
                        .setLabel("Hunting Party")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:palia_Currency_Hunting:1461568805074636801>"),
                    new ButtonBuilder()
                        .setCustomId("party_bugging")
                        .setLabel("Bugging Party")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:palia_Currency_Bug:1461570885159751842>")
                );

                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("party_mining")
                        .setLabel("Mining Party")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:palia_Currency_Mining:1461568258887913590>"),
                    new ButtonBuilder()
                        .setCustomId("party_fishing")
                        .setLabel("Fishing Party")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:palia_Currency_Fishing:1461570651667038238>"),
                    new ButtonBuilder()
                        .setCustomId("party_foraging")
                        .setLabel("Foraging Party (Flow trees included)")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:palia_Currency_Foraging:1461569002731208734>")
                );

                const msg = await thread.send({
                    content: "What are you hosting?",
                    components: [row1, row2]
                });

                const collector = msg.createMessageComponentCollector({
                    time: 10 * 60 * 1000 // 10 minutes
                });

                collector.on('collect', async (interaction) => {
                    if (interaction.user.id !== interaction.channel.ownerId) {
                        return interaction.reply({
                            content: 'Only the thread creator can use these buttons.',
                            ephemeral: true
                        });
                    }

                    const config = partyMap[interaction.customId];
                    if (!config) return;

                    const channel = interaction.guild.channels.fetch(PALIA_GENERAL_CHAT_ID);
                    await channel.send({
                        content: `<@&${config.role}> ${config.text} <#${interaction.channel.id}>`,
                        allowedMentions: { roles: [config.role] }
                    });

                    // remove ALL buttons immediately
                    await msg.delete().catch(() => { });

                    // stop collector so nothing else fires
                    await collector.stop();
                });

                collector.on('end', async () => {
                    // cleanup if expired unused
                    await msg.delete().catch(() => { });
                });

            }, 30 * 1000); // 30 seconds  
        } catch (err) {
            await errorController.sendError(client, err);
        }
    });
}

module.exports = { init };