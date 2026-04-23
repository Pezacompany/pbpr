export default async function handler(req, res) {
    const { username, state, charName, age, origin } = req.query;
    
    // TWOJE IP I PORT Z PANELU ICEHOST
    const BOT_URL = "http://83.168.94.244:40015/api/verify";

    if (!username || !state) {
        return res.status(400).send("Błąd: Brak danych użytkownika.");
    }

    try {
        // 1. Pobierz ID użytkownika Roblox
        const rbxUserRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [username] })
        });
        const rbxUserData = await rbxUserRes.json();

        if (!rbxUserData.data || rbxUserData.data.length === 0) {
            return res.status(404).send("Nie znaleziono gracza o takim nicku.");
        }

        const rbxId = rbxUserData.data[0].id;

        // 2. Pobierz profil (opis), aby sprawdzić kod
        const profileRes = await fetch(`https://users.roblox.com/v1/users/${rbxId}`);
        const profileData = await profileRes.json();

        // Weryfikacja kodu BK-XXXXXX
        if (profileData.description && profileData.description.includes(`BK-${state}`)) {
            
            // 3. Wyślij dane do bota na IceHost
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
                return res.send("<h1>Sukces! Postać utworzona. Zamknij tę stronę i wróć do Discorda.</h1>");
            } else {
                return res.status(500).send("Błąd: Bot nie odpowiedział. Sprawdź czy jest włączony na IceHost.");
            }

        } else {
            return res.status(403).send("<h1>Błąd weryfikacji! Kod w opisie Twojego profilu Roblox nie zgadza się lub go brakuje.</h1>");
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send("Błąd krytyczny serwera weryfikacji.");
    }
}
