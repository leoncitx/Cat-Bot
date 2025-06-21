let handler = async (m, { isPrems, conn }) => {
let time = global.db.data.users[m.sender].lastcofre + 0 
if (new Date - global.db.data.users[m.sender].lastcofre < 0) throw `⏳ Ya reclamaste tu cofre. Vuelve en *${msToTime(time - new Date())}* para reclamar de nuevo.`

let img = 'https://files.catbox.moe/ltq7ph.jpg'

let texto = `
✨🎨 *MENÚ CREACIÓN DE LOGOS* 🎨✨
––––––––––––––––––––––––––––––––––––––

_¡Crea logos increíbles con un solo comando!_

💖 .logocorazon (texto)
🎄 .logochristmas (texto)
💑 .logopareja (texto)
👾 .logoglitch (texto)
😔 .logosad (texto)
🎮 .logogaming (texto)
🚶‍♂️ .logosolitario (texto)
🐉 .logodragonball (texto)
💡 .logoneon (texto)
🐱 .logogatito (texto)
👧🎮 .logochicagamer (texto)
🎖️ .logoarmy (texto)
🥷 .logonaruto (texto)
🚀 .logofuturista (texto)
☁️ .logonube (texto)
👼 .logoangel (texto) 
🌌 .logocielo (texto)
✍️ .logograffiti3d (texto)
💻 .logomatrix (texto)
🔪 .logohorror (texto)
🦅 .logoalas (texto) 
🔫 .logopubg (texto)
⚔️ .logoguerrero (texto)
👸🔫 .logopubgfem (texto)
👑 .logolol (texto)
👽 .logoamongus (texto)
🎧 .logoportadaplayer (texto)
🔥 .logoportadaff (texto)
🐯🎬 .logovideotiger (texto)
🎬✨ .logovideointro (texto)
🎮🎬 .logovideogaming (texto)
😼 .sadcat (texto)
🐦 .tweet (comentario)

––––––––––––––––––––––––––––––––––––––
`

const fkontak = {
        "key": {
    "participants":"0@s.whatsapp.net",
                "remoteJid": "status@broadcast",
                "fromMe": false,
                "id": "Halo"
        },
        "message": {
                "contactMessage": {
                        "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
        },
        "participant": "0@s.whatsapp.net"
}
await conn.sendFile(m.chat, img, 'img.jpg', texto, fkontak)
global.db.data.users[m.sender].lastcofre = new Date * 1
}
handler.help = ['menu3']
handler.tags = ['main', 'logo']
handler.command = ['menulogos', 'logos', 'menu3'] 
export default handler

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + " horas " + minutes + " minutos " + seconds + " segundos";
}
