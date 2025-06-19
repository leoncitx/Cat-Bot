
import fetch from 'node-fetch';

let handler = async (m, { conn, text}) => {
  if (!text) {
    return m.reply(`💨 *Spotify Downloader*

Por favor, ingresa el nombre de una canción.

📌 Ejemplo:
.spotify Shape of You`);
}

  await m.react('🔍');

  try {
    const res = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status ||!json.result?.downloadUrl) {
      return m.reply("❌ No se pudo obtener la canción. Intenta con otro título.");
}

    const song = json.result;
    const title = song.title && song.title.trim()? song.title: "Título desconocido";
    const artists = Array.isArray(song.artists) && song.artists.length> 0
? song.artists.join(", ")
: "Artista no encontrado";

    let duracionFormateada = "Duración desconocida";
    if (song.duration) {
      const dur = parseInt(song.duration);
      if (!isNaN(dur) && dur> 0) {
        const min = Math.floor(dur / 60000);
        const seg = Math.floor((dur % 60000) / 1000);
        duracionFormateada = `${min}:${String(seg).padStart(2, "0")}`;
}
}

    await conn.sendMessage(m.chat, {
      text: `🎶 *Spotify Track*

📛 *Título:* ${title}
🎤 *Artista(s):* ${artists}
⏱️ *Duración:* ${duracionFormateada}

📥 Descargando...`,
}, { quoted: m});

    await conn.sendMessage(m.chat, {
      audio: { url: song.downloadUrl},
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
}, { quoted: m});

    await m.react('✅');
} catch (error) {
    console.error(error);
    m.reply("⚠️ Ocurrió un error al procesar tu búsqueda. Intenta nuevamente más tarde.");
}
};

handler.help = ['spotify <nombre de canción>'];
handler.tags = ['descargas'];
handler.command = ['spotify'];

export default handler;