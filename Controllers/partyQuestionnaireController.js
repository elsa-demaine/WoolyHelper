const {
    PARTY_UP_ID,
    L4G_ID,
    EXTERNAL_PARTIES_ID
} = require('./../config.js');
const errorController = require('./../errorHandler.js');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

function init(client) {
    client.on('threadCreate', async (thread) => {
        try {
            //private thread
            if (!thread.isThread()) return;
            //Not created in Party up
            if (thread.parentId !== PARTY_UP_ID) return;

            setTimeout(async () => {
                await thread.send({
                    content: "What are you hosting?",
                    components: [
                        new ActionRowBuilder().addComponents(
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
                        )
                    ]
                });

                await thread.send({
                    components: [
                        new ActionRowBuilder().addComponents(
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
                                .setCustomId("party_forage")
                                .setLabel("Foraging Party (Flow trees included)")
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji("<:palia_Currency_Foraging:1461569002731208734>")
                        )
                    ]
                });
            }, 500);      
        } catch (err) {
            await errorController.sendError(client, err);
        }
    });

    client.on('interactionCreate', async (interaction) => {
        try {
            const onlyCreator = 'Only the thread creator can use theses buttons.';

            if (interaction.isButton() && interaction.customId === "party_lfg") {
                if (interaction.user.id !== interaction.channel.ownerId) {
                    return interaction.reply({
                        content: onlyCreator,
                        ephemeral: true
                    });
                }

                await interaction.reply({
                    content: `<@&${L4G_ID}> looking for a group!`,
                    allowedMentions: {
                        roles: [L4G_ID]
                    }
                });
            }

            if (interaction.isButton() && interaction.customId === "party_cooking") {
                if (interaction.user.id !== interaction.channel.ownerId) {
                    return interaction.reply({
                        content: onlyCreator,
                        ephemeral: true
                    });
                }

                await interaction.reply({
                    content: `<@&${EXTERNAL_PARTIES_ID}> external cooking party!`,
                    allowedMentions: {
                        roles: [EXTERNAL_PARTIES_ID]
                    }
                });
            }

            if (interaction.isButton() && interaction.customId === "party_hunting") {
                if (interaction.user.id !== interaction.channel.ownerId) {
                    return interaction.reply({
                        content: onlyCreator,
                        ephemeral: true
                    });
                }

                await interaction.reply({
                    content: `<@&${EXTERNAL_PARTIES_ID}> external hunting party!`,
                    allowedMentions: {
                        roles: [EXTERNAL_PARTIES_ID]
                    }
                });
            }    

            if (interaction.isButton() && interaction.customId === "party_bugging") {
                if (interaction.user.id !== interaction.channel.ownerId) {
                    return interaction.reply({
                        content: onlyCreator,
                        ephemeral: true
                    });
                }

                await interaction.reply({
                    content: `<@&${EXTERNAL_PARTIES_ID}> external bugging party`,
                    allowedMentions: {
                        roles: [EXTERNAL_PARTIES_ID]
                    }
                });
            }

            if (interaction.isButton() && interaction.customId === "party_mining") {
                if (interaction.user.id !== interaction.channel.ownerId) {
                    return interaction.reply({
                        content: onlyCreator,
                        ephemeral: true
                    });
                }

                await interaction.reply({
                    content: `<@&${EXTERNAL_PARTIES_ID}> external mining party!`,
                    allowedMentions: {
                        roles: [EXTERNAL_PARTIES_ID]
                    }
                });
            }

            if (interaction.isButton() && interaction.customId === "party_fishing") {
                if (interaction.user.id !== interaction.channel.ownerId) {
                    return interaction.reply({
                        content: onlyCreator,
                        ephemeral: true
                    });
                }

                await interaction.reply({
                    content: `<@&${EXTERNAL_PARTIES_ID}> external fishing party!`,
                    allowedMentions: {
                        roles: [EXTERNAL_PARTIES_ID]
                    }
                });
            }

            if (interaction.isButton() && interaction.customId === "party_forage") {
                if (interaction.user.id !== interaction.channel.ownerId) {
                    return interaction.reply({
                        content: onlyCreator,
                        ephemeral: true
                    });
                }

                await interaction.reply({
                    content: `<@&${EXTERNAL_PARTIES_ID}> external foraging party!`,
                    allowedMentions: {
                        roles: [EXTERNAL_PARTIES_ID]
                    }
                });
            }
        } catch (err) {
            await errorController.sendError(client, err);
        }
    });
}

module.exports = { init };