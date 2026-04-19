const { Client, GatewayIntentBits } = require('discord.js');

export default async function handler(req, res) {
    const { username, state } = req.query; // username z inputa, state to ID Discorda

    const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
    const LOG_CHANNEL_ID = "1495433566484562061"; // <--- TUTAJ WPISZ ID KANAŁU Z TWOJEGO SERWERA

    if (!username || !state) {
        return res.status(400).send("Błąd: Brak nicku lub ID Discorda.");
    }

    try {
        // 1. Szukamy użytkownika na Roblox (Metoda dokładna - POST)
        const userSearchRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usernames: [username],
                excludeBannedUsers: true
            })
        });
        
        const searchData = await userSearchRes.json();

        if (!searchData.data || searchData.data.length === 0) {
            return res.status(404).send(`Nie znaleziono gracza o nicku "${username}". Upewnij się, że wpisujesz nazwę użytkownika (z @), a nie nazwę wyświetlaną (Display Name)!`);
        }

        const rbxId = searchData.data[0].id;
        const rbxRealName = searchData.data[0].name; // Oficjalny Username

        // 2. Pobieramy opis (Bio) tego użytkownika
        const userProfileRes = await fetch(`https://users.roblox.com/v1/users/${rbxId}`);
        const profileData = await userProfileRes.json();
        const bio = profileData.description || "";

        // 3. Sprawdzamy czy w bio jest poprawny kod
        const expectedCode = `BCK-${state}`;

        if (bio.includes(expectedCode)) {
            // SUKCES - Łączymy się z Discordem, żeby wysłać sygnał do bota na IceHost
            const client = new Client({ intents: [GatewayIntentBits.Guilds] });
            await client.login(DISCORD_TOKEN);
            
            const channel = await client.channels.fetch(LOG_CHANNEL_ID);
            if (!channel) {
                return res.status(500).send("Błąd: Nie znaleziono kanału logów na Discordzie.");
            }

            // Wysyłamy sygnał DB_SAVE, który odbierze Twój bot na IceHost
            await channel.send(`DB_SAVE|${state}|${rbxRealName}`);
            
            client.destroy();

            // Przekierowanie na stronę z komunikatem sukcesu
            return res.redirect(`/?status=success&name=${rbxRealName}`);
        } else {
            // BŁĄD - Kod nie pasuje
            return res.status(400).send(`Nie znaleziono kodu "${expectedCode}" w Twoim opisie na Roblox. Obecnie Twój opis to: "${bio || "Pusty"}"`);
        }

    } catch (error) {
        console.error("Błąd weryfikacji:", error);
        return res.status(500).send("Wystąpił błąd podczas weryfikacji: " + error.message);
    }
}
