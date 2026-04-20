export default async function handler(req, res) {
    const { username, state, charName, age, origin } = req.query;
    const LOG_CHANNEL_ID = "1495793897451028592";

    try {
        const userRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [username] })
        });
        const userData = await userRes.json();
        if (!userData.data[0]) return res.redirect(`/?id=${state}&status=error&msg=Nie znaleziono gracza.`);

        const rbxId = userData.data[0].id;
        const profileRes = await fetch(`https://users.roblox.com/v1/users/${rbxId}`);
        const profile = await profileRes.json();

        if (profile.description.includes(`BCK-${state}`)) {
            // Sygnał do bota na Discord (Baza Danych)
            const DISCORD_WEBHOOK = process.env.DB_WEBHOOK; 
            await fetch(DISCORD_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `DATA_ID|DC:${state}|RBX:${rbxId}|SLOT:1|P1[${charName}|${age}|${origin}|Obywatel / Turysta]|P2[Brak|N/A|N/A|Brak]|EXIT:null`
                })
            });
            return res.redirect(`/?status=success`);
        } else {
            return res.redirect(`/?id=${state}&status=error&msg=Błędny kod w Bio.`);
        }
    } catch (e) { res.redirect(`/?id=${state}&status=error&msg=Błąd API.`); }
}
