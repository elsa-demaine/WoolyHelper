const axios = require("axios");
const cheerio = require("cheerio");
const errorController = require('./../errorHandler.js');
const {
    PALIA_ID
} = require('./../config.js');

let cache = {
    data: null,
    timestamp: 0,
};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Convert date string → Unix timestamp
function parseDate(dateStr) {
    const parsed = new Date(dateStr + " UTC");
    return Math.floor(parsed.getTime() / 1000);
}

// Fetch + cache
function init(client) {
    client.on('messageCreate', async (message) => {
        try {
            if (message.channel.parentId !== PALIA_ID) return; // ignore other channels not in Palia category
            if (String(message.content).toUpperCase() === String(`!maji`).toUpperCase()) {

                const event = await getNextMajiMarket(client);

                if (!event) {
                    return message.reply(
                        "❌ Couldn't fetch the next [Maji Market](<https://palia.wiki.gg/wiki/Maji_Market>)."
                    );
                }

                if (event.ongoing) {
                    return message.reply(
                        `**[Maji Market](<https://palia.wiki.gg/wiki/Maji_Market>) is LIVE!**\n` +
                        `Ends <t:${event.endTs}:R> on <t:${event.endTs}:F>`
                    );
                }

                return message.reply(
                    `**Next [Maji Market](<https://palia.wiki.gg/wiki/Maji_Market>)**\n` +
                    `Start: <t:${event.startTs}:F> - End: <t:${event.endTs}:F>` +
                    `Starts in: <t:${event.startTs}:R>`
                );
            }
        } catch (err) {
        console.error(err);
        await errorController.sendError(client, err);
    }
    })
}

module.exports = { init };

async function getNextMajiMarket(client) {
        const now = Date.now();

        if (cache.data && now - cache.timestamp < CACHE_DURATION) {
            return cache.data;
        }

        try {
            const url = "https://palia.wiki.gg/wiki/Maji_Market";
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            let result = null;
            const currentTs = Math.floor(Date.now() / 1000);

            // Look through ALL rows
            $("tr").each((i, el) => {
                const text = $(el).text();

                // detect rows with dates (simple heuristic)
                if (text.match(/\d{4}/) && text.toLowerCase().includes("maji")) {
                    const cols = $(el).find("td");

                    if (cols.length >= 2) {
                        const start = $(cols[1]).text().trim();
                        const end = $(cols[2])?.text().trim();

                        const startTs = parseDate(start);
                        const endTs = parseDate(end);

                        if (!startTs || !endTs) return;

                        // Ongoing event
                        if (startTs <= currentTs && endTs >= currentTs) {
                            result = {
                                startTs,
                                endTs,
                                ongoing: true,
                            };
                            return false;
                        }

                        // Future event
                        if (startTs > currentTs && !result) {
                            result = {
                                startTs,
                                endTs,
                                ongoing: false,
                            };
                        }                     
                    }
                }
            });

            cache = {
                data: result,
                timestamp: now,
            };

            return result;

    } catch (err) {
        await errorController.sendError(client, err);
        return null;
    }
}

function parseDate(dateStr) {
    if (!dateStr) return null;

    // Fix format issues
    const cleaned = dateStr
        .replace(/(\d)(am|pm)/i, "$1 $2") // "7:00am" → "7:00 am"
        .replace(/^[A-Za-z]+,\s*/, "")    // remove "Tuesday, "
        .trim();

    const parsed = new Date(cleaned + " UTC");

    if (isNaN(parsed.getTime())) {
        console.log("❌ Failed to parse:", dateStr, "→", cleaned);
        return null;
    }

    return Math.floor(parsed.getTime() / 1000);
}