import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw m.reply(`
╭━━〔 *❌ FALTA TEXTO* 〕━━⬣
┃ 🍡 *Usa el comando así:*
┃ ⎔ ${usedPrefix + command} <nombre canción>
┃ 💽 *Ejemplo:* ${usedPrefix + command} Believer
╰━━━━━━━━━━━━━━━━━━━━⬣
  `.trim());

  await m.react('🌀');

  let ouh = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${text}`);
  let gyh = await ouh.json();

  await conn.sendMessage(m.chat, {
    audio: { url: gyh.result.downloadUrl },
    mimetype: 'audio/mpeg'
  }, { quoted: m });

  await m.reply(`
╭━〔 *🔊 SPOTIFY DOWNLOADER* 〕━⬣
┃ 🌀 *Petición:* ${text}
┃ 💣 *Estado:* Éxito, canción enviada.
╰━━━━━━━━━━━━━━━━━━━━⬣
  `.trim());

  await m.react('🎵');
}

handler.help = ['music *<texto>*'];
handler.tags = ['descargas'];
handler.command = ['music'];

export default handler;
