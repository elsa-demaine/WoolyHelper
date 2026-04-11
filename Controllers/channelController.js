const {
    MON_ID,
    TUE_ID,
    WED_ID,
    THU_ID,
    FRI_ID,
    SAT_ID,
    SUN_ID,
    PARTY_UP_ID
} = require('./../config.js');

async function CheckParties(guild, categoryId) {
    if (categoryId === PARTY_UP_ID) {
        const partyUp = guild.channels.cache.get(PARTY_UP_ID);

        partyUp.threads.cache.forEach(async (thread) => {
            if (await isInactive(thread, 48)) {
                console.log(`${thread.name} is ready to be deleted`);
                thread.delete();
            } else {
                console.log(`${thread.name} is still in use`);
            }
        });
    } else {
        const channels = guild.channels.cache.filter(
            c => c.parentId === categoryId
        );

        channels.forEach(async (chan) => {
            if (isExpired(chan) && await isInactive(chan, 24)) {
                console.log(`${chan.name} is being deleted`);
                chan.delete();
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
            const guild = client.guilds.cache.first();

            CheckParties(guild, PARTY_UP_ID);
            CheckParties(guild, MON_ID);
            CheckParties(guild, TUE_ID);
            CheckParties(guild, WED_ID);
            CheckParties(guild, THU_ID);
            CheckParties(guild, FRI_ID);
            CheckParties(guild, SAT_ID);
            CheckParties(guild, SUN_ID);

        }, 2 * 60 * 60 * 1000); // 2 hours (hour * minute * seconds * milliseconds)
    });
};

module.exports = { init };
