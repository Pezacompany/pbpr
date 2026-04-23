export default async function handler(req, res) {
    const { username, state, charName, age, origin } = req.query;
    const BOT_URL = "http://83.168.94.244:40015"; // TWÓJ ADRES ICEHOST

    try {
        // 1. Pobierz kod jaki bot wygenerował dla tego użytkownika
        const codeRes = await fetch(`${BOT_URL}/api/getcode/${state}`);
        const codeData = await codeRes.json();
        
        if (!codeData.code) {
            return res.status(400).send("<h1>Błąd: Najpierw wygeneruj kod na Discordzie!</h1>");
        }
        const expectedCode = codeData.code;

        // 2. Pobierz dane z Roblox
        const userRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [username] })
        });
        const userData = await userRes.json();
        const rbxId = userData.data[0].id;

        const profileRes = await fetch(`https://users.roblox.com/v1/users/${rbxId}`);
        const profile = await profileRes.json();

        // 3. Sprawdź czy kod się zgadza
        if (profile.description && profile.description.includes(expectedCode)) {
            
            // 4. Zatwierdź w bocie
            await fetch(`${BOT_URL}/api/verify`, {
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

            return res.send("<h1>✅ SUKCES! Postać stworzona. Wróc na Discord.</h1>");
        } else {
            return res.status(403).send(`<h1>❌ BŁĄD!</h1><p>W opisie profilu Roblox musi być kod: <b>${expectedCode}</b></p>`);
        }
    } catch (e) {
        return res.status(500).send("<h1>Błąd połączenia z botem. Sprawdź czy bot na IceHost działa.</h1>");
    }
}
