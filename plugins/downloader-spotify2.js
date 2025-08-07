
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

  try {
    let res = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
    let json = await res.json();

    if (!json.result ||!json.result.downloadUrl) {
      throw new Error('No se encontró la canción');
}

    // Enviar imagen si existe
    if (json.result.thumbnail) {
      await conn.sendMessage(m.chat, {
        image: { url: json.result.thumbnail},
        caption: `🎶 *${json.result.title || text}*\n🎤 *${json.result.artist || 'Artista desconocido'}*`
}, { quoted: m});
}

    // Enviar audio
    await conn.sendMessage(m.chat, {
      audio: { url: json.result.downloadUrl},
      mimetype: 'audio/mpeg'
}, { quoted: m});

    // Confirmación final
    await m.reply(`
╭━〔 *🔊 SPOTIFY DOWNLOADER* 〕━⬣
┃ 🌀 *Petición:* ${text}
┃ 💣 *Estado:* Éxito, canción enviada.
╰━━━━━━━━━━━━━━━━━━━━⬣
    `.trim());

    await m.react('🎵');
} catch (e) {
    console.error(e);
    await m.reply('❌ Hubo un error al procesar tu solicitud. Intenta con otro nombre de canción.');
    await m.react('❌');
}
};

handler.help = ['music *<texto>*'];
handler.tags = ['descargas'];
handler.command = ['music'];

export default handler;