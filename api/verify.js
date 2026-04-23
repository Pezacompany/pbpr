<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Kreator Postaci</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>body { background-color: #0f1113; color: white; }</style>
</head>
<body class="flex items-center justify-center min-h-screen">
    <div class="bg-[#1a1d21] p-8 rounded-lg w-full max-w-sm border border-gray-800 shadow-2xl">
        <h2 class="text-xl font-bold mb-6 text-center border-b border-gray-700 pb-4">WERYFIKACJA</h2>
        
        <form action="/api/verify" method="GET" class="space-y-4">
            
            <input type="hidden" name="state" id="discordIdInput">

            <div>
                <label class="block text-xs text-gray-500 uppercase mb-1">Nick Roblox (dokładny)</label>
                <input type="text" name="username" required class="w-full p-2 bg-black border border-gray-700 rounded outline-none focus:border-gray-400">
            </div>

            <div>
                <label class="block text-xs text-gray-500 uppercase mb-1">Imię i Nazwisko Postaci</label>
                <input type="text" name="charName" required class="w-full p-2 bg-black border border-gray-700 rounded outline-none focus:border-gray-400">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-500 uppercase mb-1">Wiek</label>
                    <input type="number" name="age" required class="w-full p-2 bg-black border border-gray-700 rounded outline-none focus:border-gray-400">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 uppercase mb-1">Pochodzenie</label>
                    <input type="text" name="origin" required class="w-full p-2 bg-black border border-gray-700 rounded outline-none focus:border-gray-400">
                </div>
            </div>

            <button type="submit" class="w-full py-3 mt-4 bg-white text-black font-bold rounded hover:bg-gray-300 transition">
                ZATWIERDŹ POSTAĆ
            </button>
        </form>
    </div>

    <script>
        const urlParams = new URLSearchParams(window.location.search);
        document.getElementById('discordIdInput').value = urlParams.get('id');
    </script>
</body>
</html>
