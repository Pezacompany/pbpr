export default async function handler(req, res) {
    const { username, state, charName, age, origin } = req.query;
    const BOT_URL = "http://83.168.94.244:40015";

    try {
        const codeRes = await fetch(`${BOT_URL}/api/getcode/${state}`);
        const codeData = await codeRes.json();
        if (!codeData.code) return res.status(400).send("Najpierw wygeneruj kod na Discordzie!");

        const userRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [username] })
        });
        const userData = await userRes.json();
        if (!userData.data[0]) return res.status(404).send("Użytkownik Roblox nie istnieje.");

        const rbxId = userData.data[0].id;
        const profileRes = await fetch(`https://users.roblox.com/v1/users/${rbxId}`);
        const profile = await profileRes.json();

        if (profile.description && profile.description.includes(codeData.code)) {
            const final = await fetch(`${BOT_URL}/api/verify`, {
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
            if (final.ok) return res.status(200).send("OK");
            else return res.status(500).send("Bot na IceHost nie odpowiada.");
        } else {
            return res.status(403).send(`Brak kodu <b>${codeData.code}</b> w opisie profilu.`);
        }
    } catch (e) {
        return res.status(500).send("Błąd serwera: " + e.message);
    }
}
