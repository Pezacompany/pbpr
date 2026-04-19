const { Client, GatewayIntentBits } = require('discord.js');

export default async function handler(req, res) {
    const { username, state } = req.query; 

    const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
    const LOG_CHANNEL_ID = "1495433566484562061"; // Upewnij się, że to ID jest poprawne!

    if (!username || !state) {
        return res.status(400).send("Błąd: Brak nicku lub ID Discorda w zapytaniu.");
    }

    try {
        // 1. Szukamy użytkownika na Roblox
        const userSearchRes = await fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=1`);
        const searchData = await userSearchRes.json();

        // ZABEZPIECZENIE PRZED BŁĘDEM "length of undefined"
        if (!searchData || !searchData.data || searchData.data.length === 0) {
            return res.status(404).send(`Nie znaleziono użytkownika o nicku "${username}" na Roblox. Sprawdź pisownię!`);
        }

        const rbxId = searchData.data[0].id;
        const rbxRealName = searchData.data[0].name;

        // 2. Pobieramy opis (Bio) tego użytkownika
        const userProfileRes = await fetch(`https://users.roblox.com/v1/users/${rbxId}`);
        const profileData = await userProfileRes.json();
        
        if (!profileData || !profileData.description && profileData.description !== "") {
            return res.status(500).send("Błąd: Nie udało się pobrać opisu profilu z Roblox.");
        }

        const bio = profileData.description;
        const expectedCode = `BCK-${state}`;

        // 3. Sprawdzamy kod w Bio
        if (bio.includes(expectedCode)) {
            const client = new Client({ intents: [GatewayIntentBits.Guilds] });
            await client.login(DISCORD_TOKEN);
            
            const channel = await client.channels.fetch(LOG_CHANNEL_ID);
            if (!channel) throw new Error("Nie znaleziono kanału logów. Sprawdź ID!");

            // Sygnał do bota na IceHost
            await channel.send(`DB_SAVE|${state}|${rbxRealName}`);
            
            client.destroy();
            return res.redirect(`/?status=success&name=${rbxRealName}`);
        } else {
            return res.status(400).send(`Błąd: Nie znaleziono kodu "${expectedCode}" w Twoim opisie profilu. Obecnie Twój opis to: "${bio || "Pusty"}"`);
        }

    } catch (error) {
        console.error("LOG BŁĘDU:", error);
        return res.status(500).send(`Wystąpił błąd: ${error.message}`);
    }
}
