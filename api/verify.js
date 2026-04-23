export default async function handler(req, res) {
    const { username, state, charName, age, origin } = req.query;
    
    // TWOJE DOKŁADNE DANE Z ICEHOST
    const BOT_URL = "http://83.168.94.244:40015/api/verify";

    try {
        // 1. Pobieranie ID Roblox
        const userRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [username] })
        });
        const userData = await userRes.json();
        
        if (!userData.data || userData.data.length === 0) {
            return res.status(404).send(`<body style="background:#0f1113;color:white;text-align:center;padding:50px;font-family:sans-serif;"><h1>❌ Błąd: Nie znaleziono konta Roblox o nicku: ${username}</h1></body>`);
        }
        const rbxId = userData.data[0].id;

        // 2. Pobieranie opisu konta Roblox i szukanie kodu BK-
        const profileRes = await fetch(`https://users.roblox.com/v1/users/${rbxId}`);
        const profile = await profileRes.json();

        if (profile.description && profile.description.includes(`BK-${state}`)) {
            
            // 3. Wysłanie danych do IceHost
            const botRes = await fetch(BOT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: state,
                    robloxId: rbxId.toString(),
                    robloxNick: username,
                    name: charName,
                    age: age,
                    origin: origin
                })
            });

            if (botRes.ok) {
                return res.send(`<body style="background:#0f1113;color:white;text-align:center;padding:50px;font-family:sans-serif;"><h1>✅ Weryfikacja zakończona sukcesem!</h1><p>Twoja postać została stworzona. Możesz zamknąć tę kartę i wrócić na Discorda.</p></body>`);
            } else {
                return res.status(500).send(`<body style="background:#0f1113;color:white;text-align:center;padding:50px;font-family:sans-serif;"><h1>❌ Błąd: Bot Discord zablokował połączenie (nie odpowiada na porcie 40015).</h1></body>`);
            }

        } else {
            return res.status(403).send(`<body style="background:#0f1113;color:white;text-align:center;padding:50px;font-family:sans-serif;"><h1>❌ Błąd: Kod z Discorda nie znajduje się w opisie Twojego profilu Roblox.</h1><p>Wklej kod BK-... do opisu i spróbuj ponownie.</p></body>`);
        }
    } catch (error) {
        return res.status(500).send(`<body style="background:#0f1113;color:white;text-align:center;padding:50px;font-family:sans-serif;"><h1>❌ Błąd komunikacji Vercel -> Roblox API</h1></body>`);
    }
}
