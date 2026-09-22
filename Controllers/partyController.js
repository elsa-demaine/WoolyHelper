const {
    PALIA_GENERAL_CHAT,
    SCHEDULED_PARTIES,
    MINERS,
    CHEFS,
    FORAGERS,
    HUNTERS,
    BUGGERS,
    FISHERS,
    BUILDERS,
    PARTY_GOBLINS
} = require('./../config.js');
const errorController = require('./../errorHandler.js');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

function init(client) {
    const partyMap = {
        party_cooking: { role: CHEFS, text: "check out this new cooking party!" },
        party_hunting: { role: HUNTERS, text: "check out this new hunting party!" },
        party_bugging: { role: BUGGERS, text: "check out this new bugging party!" },
        party_mining: { role: MINERS, text: "check out this new mining party!" },
        party_fishing: { role: FISHERS, text: "check out this new fishing party!" },
        party_foraging: { role: FORAGERS, text: "check out this new foraging party!" },
        party_furniture: { role: BUILDERS, text: "check out this new decor party!" },
        party_goblin: { role: PARTY_GOBLINS, text: "check out this new party!" }
    };

    client.on('threadCreate', async (thread) => {
        try {
            //private thread
            if (!thread.isThread()) return;
            //Not created in Scheduled Parties
            if (thread.parentId !== SCHEDULED_PARTIES) return;

            setTimeout(async () => {

                const row1 = new ActionRowBuilder().addComponents(
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
                        .setEmoji("<:palia_currency_bug:1504661926930682017>"),
                    new ButtonBuilder()
                        .setCustomId("party_foraging")
                        .setLabel("Foraging Party (Flow trees included)")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:palia_currency_foraging:1504662204102869114>")                    
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
                        .setCustomId("party_furniture")
                        .setLabel("Decor competition, glitch tutoriels")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:palia_currency_furniture:1504662112956579981>"),
                    new ButtonBuilder()
                        .setCustomId("party_goblin")
                        .setLabel("Any other type of party")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:wooly_party:1542547938323075104>")
                );

                const msg = await thread.send({
                    content: "What are you hosting?",
                    components: [row1, row2]
                });

                const collector = msg.createMessageComponentCollector({
                    time: 20 * 60 * 1000 // 20 minutes
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
                        interaction.guild.channels.cache.get(PALIA_GENERAL_CHAT) ||
                        await interaction.guild.channels.fetch(PALIA_GENERAL_CHAT);
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

            }, 5 * 1000); // 5 seconds before popping up
        } catch (err) {
            await errorController.sendError(client, err);
        }
    });
}

module.exports = { init };