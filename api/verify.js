const { Client, GatewayIntentBits } = require('discord.js');

export default async function handler(req, res) {
    const { username, state } = req.query;
    const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
    const LOG_CHANNEL_ID = "1495433566484562061";

    if (!username || !state) {
        return res.redirect(`/?id=${state}&status=error&msg=Brak danych (nick/ID).`);
    }

    try {
        const userSearchRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
        });
        const searchData = await userSearchRes.json();

        if (!searchData.data || searchData.data.length === 0) {
            return res.redirect(`/?id=${state}&status=error&msg=Nie znaleziono gracza ${username}.`);
        }

        const rbxId = searchData.data[0].id;
        const rbxRealName = searchData.data[0].name;

        const userProfileRes = await fetch(`https://users.roblox.com/v1/users/${rbxId}`);
        const profileData = await userProfileRes.json();
        const bio = profileData.description || "";
        const expectedCode = `BCK-${state}`;

        if (bio.includes(expectedCode)) {
            const client = new Client({ intents: [GatewayIntentBits.Guilds] });
            await client.login(DISCORD_TOKEN);
            const channel = await client.channels.fetch(LOG_CHANNEL_ID);
            
            await channel.send(`DB_SAVE|${state}|${rbxRealName}|${rbxId}`);
            client.destroy();

            return res.redirect(`/?status=success&name=${rbxRealName}`);
        } else {
            return res.redirect(`/?id=${state}&status=error&msg=Nie znaleziono kodu w Bio!`);
        }

    } catch (error) {
        return res.redirect(`/?id=${state}&status=error&msg=Błąd serwera. Spróbuj później.`);
    }
}
