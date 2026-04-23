export default async function handler(req, res) {
    const { username, state, charName, age, origin } = req.query;
    
    // TWOJE_IP_ICEHOST musi być stałym IP z portem 3000
    const BOT_API_URL = "http://83.168.94.244:3000/api/verify";

    try {
        // 1. Pobieranie ID z Nicku
        const userRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [username] })
        });
        const userData = await userRes.json();
        
        if (!userData.data || userData.data.length === 0) {
            return res.redirect(`/?id=${state}&status=error&msg=Nie znaleziono gracza Roblox!`);
        }
        
        const rbxId = userData.data[0].id;

        // 2. Pobieranie profilu i sprawdzanie kodu
        const profileRes = await fetch(`https://users.roblox.com/v1/users/${rbxId}`);
        const profile = await profileRes.json();

        // Sprawdzamy czy kod BCK-XXXXXX jest w opisie
        if (profile.description.includes(`BK-${state}`) || profile.description.includes(`BCK-${state}`)) {
            
            // 3. Wysyłanie danych do bota na IceHost zamiast do webhooka
            const response = await fetch(BOT_API_URL, {
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

            if (response.ok) {
                return res.redirect(`/?status=success`);
            } else {
                return res.redirect(`/?id=${state}&status=error&msg=Bot nie odpowiedzial!`);
            }

        } else {
            return res.redirect(`/?id=${state}&status=error&msg=Kod w opisie profilu jest niepoprawny!`);
        }
    } catch (e) {
        console.error(e);
        return res.redirect(`/?status=error&msg=Blad Serwera API`);
    }
}
