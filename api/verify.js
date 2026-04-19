const { Client, GatewayIntentBits } = require('discord.js');

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

export default async function handler(req, res) {
    const { code, state } = req.query; // state = ID Discorda użytkownika

    // DANE Z TWOICH SCREENÓW
    const CLIENT_ID = "5490810913407316280"; 
    const CLIENT_SECRET = "RBX-xY9CFNjaMEuqnxQCWYiPUdVe8SXxzNZr53LTNrUbEsyEDRQnPFgoIDfR5fmkYN6n"; 
    const REDIRECT_URI = "https://pbpr.vercel.app/api/verify";
    
    const DISCORD_TOKEN = "MTQ5NTQyMTUzMTgyMjYyNDg5OQ.GztIRR.OLFH697JoJ8X_D_A4AZ_ptdu_lQ884m5X3RLjc";
    const GUILD_ID = "1493713101151928340";
    const ROLE_ID = "1494031035841777836";

    if (!code) return res.status(400).send("Błąd: Brak kodu z Robloxa.");

    try {
        // 1. Wymiana kodu na Access Token
        const tokenRes = await fetch('https://apis.roblox.com/oauth/v1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });
        const tokens = await tokenRes.json();

        // 2. Pobranie danych o graczu
        const userRes = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        const robloxUser = await userRes.json();

        // 3. Nadanie rangi na Discordzie
        await discordClient.login(DISCORD_TOKEN);
        const guild = await discordClient.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(state);

        await member.roles.add(ROLE_ID);
        await member.setNickname(`${robloxUser.preferred_username} | ✅`);

        // 4. Sukces - powrót na stronę z komunikatem
        res.redirect(`/?status=success&name=${robloxUser.preferred_username}`);

    } catch (error) {
        console.error(error);
        res.status(500).send("Wystąpił błąd podczas weryfikacji.");
    }
}
