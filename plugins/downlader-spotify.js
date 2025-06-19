
import fetch from 'node-fetch';

const handler = async (m, { conn, text}) => {
  if (!text) {
    return m.reply(`🎧 *Spotify Downloader*

Por favor, escribe el nombre de una canción para buscar y descargar desde Spotify.

📌 Ejemplo:
.spotifymp3 Shape of You`);
}

  try {
    await m.react('🔍');

    let res = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
    let json = await res.json();

    if (!json.status ||!json.result?.downloadUrl) {
      return m.reply("❌ No se pudo encontrar ni obtener el audio. Intenta con otro título.");
}

    const { title, artists, thumbnail, downloadUrl} = json.result;

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail},
      caption: `🎵 *Canción encontrada*

📌 *Título:* ${title}
🎤 *Artista:* ${artists?.join(", ") || "Desconocido"}

⏬ Enviando el audio...`,
}, { quoted: m});

    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl},
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
}, { quoted: m});

    await m.react('✅');
} catch (err) {
    console.error(err);
    await m.reply("⚠️ Ocurrió un error al intentar descargar la canción. Intenta nuevamente.");
}
};

handler.command = ['spotify', 'spotifymp3'];
handler.help = ['spotify <canción>'];
handler.tags = ['descargas'];

export default handler;