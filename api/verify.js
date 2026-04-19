const { Client, GatewayIntentBits } = require('discord.js');

export default async function handler(req, res) {
    const { state, code_rbx } = req.query; // state to ID Discorda

    const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
    const LOG_CHANNEL_ID = "1495433566484562061"; 

    // Jeśli gracz dopiero wszedł (nie ma kodu z Robloxa w URL)
    if (!req.query.username) {
        return res.status(400).send("Brak nazwy użytkownika.");
    }

    const username = req.query.username;

    try {
        // 1. Szukamy gracza na Roblox
        const userRes = await fetch(`https://users.roblox.com/v1/users/search?keyword=${username}&limit=1`);
        const userData = await userRes.json();
        if (!userData.data.length) return res.status(404).send("Nie znaleziono gracza.");
        
        const rbxId = userData.data[0].id;
        const realName = userData.data[0].name;

        // 2. Pobieramy Bio gracza
        const profileRes = await fetch(`https://users.roblox.com/v1/users/${rbxId}`);
        const profileData = await profileRes.json();
        const bio = profileData.description;

        // 3. Sprawdzamy czy w Bio jest ID Discorda (prosta weryfikacja)
        // Gracz musi wpisać w Bio: "BCK-ID_DISCORDA"
        if (bio && bio.includes(`BCK-${state}`)) {
            
            // Logujemy bota, żeby wysłał sygnał do bazy na IceHost
            const client = new Client({ intents: [GatewayIntentBits.Guilds] });
            await client.login(DISCORD_TOKEN);
            const channel = await client.channels.fetch(LOG_CHANNEL_ID);
            
            // Wysyłamy komendę do bota na IceHost
            await channel.send(`DB_SAVE|${state}|${realName}`);
            
            client.destroy();
            return res.redirect(`/?status=success&name=${realName}`);
        } else {
            return res.status(400).send(`Nie znaleziono kodu w Bio! Wpisz w swoim opisie na Roblox: BCK-${state}`);
        }

    } catch (error) {
        return res.status(500).send("Błąd: " + error.message);
    }
}
