const { Client, GatewayIntentBits } = require('discord.js');

export default async function handler(req, res) {
    const { code, state } = req.query;

    const CLIENT_ID = "5490810913407316280"; 
    const CLIENT_SECRET = process.env.ROBLOX_SECRET; 
    const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
    const GUILD_ID = "1493713101151928340";
    const ROLE_ID = "1494031035841777836";
    const REDIRECT_URI = "https://pbpr.vercel.app/api/verify";

    if (!code) return res.status(400).send("Błąd: Brak kodu z Robloxa.");

    try {
        // 1. Wymiana kodu na Access Token Robloxa
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
        if (!tokens.access_token) throw new Error("Roblox nie wydał tokenu.");

        // 2. Pobranie danych gracza
        const userRes = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        const robloxUser = await userRes.json();

        // 3. LOGOWANIE DO DISCORDA (NOWA, PEWNIEJSZA METODA)
        const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
        
        // Czekamy na pełne zalogowanie bota
        await client.login(DISCORD_TOKEN);
        
        // Pobieramy serwer i członka dopiero PO zalogowaniu
        const guild = await client.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(state);

        // Nadajemy rangę i zmieniamy nick
        await member.roles.add(ROLE_ID);
        await member.setNickname(`${robloxUser.preferred_username} | ✅`);

        // Wylogowujemy bota, żeby nie wisiał w procesach Vercela
        client.destroy();

        return res.redirect(`/?status=success&name=${robloxUser.preferred_username}`);

    } catch (error) {
        console.error("BŁĄD:", error);
        return res.status(500).send(`Wystąpił błąd: ${error.message}`);
    }
}
