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
                        .setEmoji("<:palia_currency_cooking:1504662268883767386>"),
                    new ButtonBuilder()
                        .setCustomId("party_hunting")
                        .setLabel("Hunting Party")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:palia_currency_hunting:1504662238215012362>"),
                    new ButtonBuilder()
                        .setCustomId("party_bugging")
                        .setLabel("Bugging Party")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:palia_currency_bug:1504661926930682017>")
                );

                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("party_mining")
                        .setLabel("Mining Party")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:palia_currency_mining:1504662299326156861>"),
                    new ButtonBuilder()
                        .setCustomId("party_fishing")
                        .setLabel("Fishing Party")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:palia_currency_fishing:1504662142115381448>"),
                    new ButtonBuilder()
                        .setCustomId("party_foraging")
                        .setLabel("Foraging Party (Flow trees included)")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:palia_currency_foraging:1504662204102869114>")
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

                    const channel =
                        interaction.guild.channels.cache.get(PALIA_GENERAL_CHAT_ID) ||
                        await interaction.guild.channels.fetch(PALIA_GENERAL_CHAT_ID);
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