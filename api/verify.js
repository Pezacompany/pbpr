export default async function handler(req, res) {
    const { username, state, charName, age, origin } = req.query;
    
    // TWOJE DANE Z PANELU ICEHOST
    const BOT_URL = "http://83.168.94.244:40015/api/verify";

    try {
        // 1. Pobieranie danych z Roblox
        const userRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [username] })
        });
        const userData = await userRes.json();
        const rbxId = userData.data[0].id;

        const profileRes = await fetch(`https://users.roblox.com/v1/users/${rbxId}`);
        const profile = await profileRes.json();

        // 2. Weryfikacja kodu w opisie (musi być BK-KOD)
        if (profile.description.includes(`BK-${state}`)) {
            
            // 3. Przesłanie danych do bota na IceHost
            const botResponse = await fetch(BOT_URL, {
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

            if (botResponse.ok) {
                return res.redirect(`/?status=success`);
            } else {
                return res.redirect(`/?id=${state}&status=error&msg=Bot na IceHost nie odpowiada!`);
            }
        } else {
            return res.redirect(`/?id=${state}&status=error&msg=Kod w opisie profilu jest błędny!`);
        }
    } catch (e) {
        return res.redirect(`/?status=error&msg=Błąd komunikacji z API`);
    }
}
