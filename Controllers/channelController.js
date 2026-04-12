const {
    LOG_CHANNEL_ID,
    MON_ID,
    TUE_ID,
    WED_ID,
    THU_ID,
    FRI_ID,
    SAT_ID,
    SUN_ID,
    PARTY_UP_ID
} = require('./../config.js');
const errorController = require('./../errorHandler.js');

async function CheckParties(client, guild, categoryId) {
    const channelLogs = client.channels.cache.get(LOG_CHANNEL_ID);

    if (categoryId === PARTY_UP_ID) {
        const partyUp = guild.channels.cache.get(PARTY_UP_ID);

        partyUp.threads.cache.forEach(async (thread) => {
            try {
                if (await isInactive(thread, 48)) {
                    channelLogs.send(`${thread.name} is being deleted`);
                    thread.delete();
                } else {
                    console.log(`${thread.name} is still in use`);
                }
            } catch (err) {
                console.error(err);
                await errorController.sendError(client, err);
            }
        });
    } else {
        const channels = guild.channels.cache.filter(
            c => c.parentId === categoryId
        );

        channels.forEach(async (chan) => {
            try {
                if (isExpired(chan) && await isInactive(chan, 24)) {
                    channelLogs.send(`${chan.name} is being deleted`);
                    chan.delete();
                }
            } catch (err) {
                console.error(err);
                await errorController.sendError(client, err);
            }
        });
    }    
};

function isExpired(channel) {
    const now = new Date();
    const day = Number(channel.name.slice(0, 2)) + 1;
    const month = channel.name.slice(3, 6);
    let nMonth;

    if (month === 'jan') {
        nMonth = 0;
    } else if (month === 'feb') {
        nMonth = 1;
    } else if (month === 'mar') {
        nMonth = 2;
    } else if (month === 'apr') {
        nMonth = 3;
    } else if (month === 'may') {
        nMonth = 4;
    } else if (month === 'jun') {
        nMonth = 5;
    } else if (month === 'jul') {
        nMonth = 6;
    } else if (month === 'aug') {
        nMonth = 7;
    } else if (month === 'sep') {
        nMonth = 8;
    } else if (month === 'oct') {
        nMonth = 9;
    } else if (month === 'nov') {
        nMonth = 10;
    } else { //dec
        nMonth = 11;
    }

    const chanTime = new Date(now.getFullYear(), nMonth, day);

    return now > chanTime;
};

async function isInactive(channel, hours) {
    const lastMessage = await channel.messages.fetch({ limit: 1 }).then(msgs => msgs.first());
    const now = new Date();
    const is24hours = new Date(new Date(lastMessage.createdAt).getTime() + 60 * 60 * hours * 1000);
    return now > is24hours;
};

function init(client) {
    client.once('clientReady', () => {
        setInterval(async () => {
            try {
                const guild = client.guilds.cache.first();

                CheckParties(client, guild, PARTY_UP_ID);
                CheckParties(client, guild, MON_ID);
                CheckParties(client, guild, TUE_ID);
                CheckParties(client, guild, WED_ID);
                CheckParties(client, guild, THU_ID);
                CheckParties(client, guild, FRI_ID);
                CheckParties(client, guild, SAT_ID);
                CheckParties(client, guild, SUN_ID);
            } catch (err) {
                console.error(err);
                await errorController.sendError(client, err);
            }
        }, 2 * 60 * 60 * 1000); // 2 hours (hour * minute * seconds * milliseconds)
    });
};

module.exports = { init };
