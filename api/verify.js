export default async function handler(req, res) {
    const { username, state, charName, age, origin } = req.query;
    const DB_WEBHOOK = process.env.DB_WEBHOOK; 

    try {
        const userRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [username] })
        });
        const userData = await userRes.json();
        const rbxId = userData.data[0].id;

        const profileRes = await fetch(`https://users.roblox.com/v1/users/${rbxId}`);
        const profile = await profileRes.json();

        if (profile.description.includes(`BCK-${state}`)) {
            await fetch(DB_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `DATA_ID|DC:${state}|RBX:${rbxId}|SLOT:1|P1[${charName}|${age}|${origin}|Obywatel]|P2[Brak|N/A|N/A|Brak]|EXIT:null`
                })
            });
            return res.redirect(`/?status=success`);
        } else {
            return res.redirect(`/?id=${state}&status=error&msg=Kod nie pasuje!`);
        }
    } catch (e) { res.redirect(`/?status=error&msg=Blad API`); }
}
