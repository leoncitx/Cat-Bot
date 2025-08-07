import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command}) => {
  if (!text) throw m.reply(`
╭━━〔 *❌ FALTA TEXTO* 〕━━⬣
┃ 🍡 *Usa el comando así:*
┃ ⎔ ${usedPrefix + command} <nombre canción>
┃ 💽 *Ejemplo:* ${usedPrefix + command} Believer
╰━━━━━━━━━━━━━━━━━━━━⬣
  `.trim());

  await m.react('🌀');

  // Obtener datos de la canción
  let response = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
  let data = await response.json();

  if (!data.result ||!data.result.downloadUrl ||!data.result.thumbnail) {
    throw m.reply('❌ No se pudo obtener la canción. Intenta con otro nombre.');
}

  // Enviar información y portada
  await conn.sendMessage(m.chat, {
    image: { url: data.result.thumbnail},
    caption: `
╭━〔 *🔊 SPOTIFY DOWNLOADER* 〕━⬣
┃ 🌀 *Petición:* ${text}
┃ 🎶 *Título:* ${data.result.title}
┃ 🎤 *Artista:* ${data.result.artist}
┃ 💽 *Álbum:* ${data.result.album}
┃ 📅 *Fecha:* ${data.result.release_date || 'Desconocida'}
╰━━━━━━━━━━━━━━━━━━━━⬣
    `.trim()
}, { quoted: m});

  // Enviar audio
  await conn.sendMessage(m.chat, {
    audio: { url: data.result.downloadUrl},
    mimetype: 'audio/mpeg'
}, { quoted: m});

  await m.react('🎵');
};

handler.help = ['music *<texto>*'];
handler.tags = ['descargas'];
handler.command = ['music'];

export default handler;