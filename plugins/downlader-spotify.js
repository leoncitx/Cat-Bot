
import fetch from 'node-fetch';

const handler = async (m, { conn, text}) => {
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
    const title = song?.title?.trim() || "Título desconocido";
    const artists = Array.isArray(song.artists) && song.artists.length> 0
? song.artists.join(", ")
: "Artista no encontrado";

    const views = song?.views || 0;
    const ago = song?.ago || "Fecha desconocida";
    const videoUrl = song?.sourceUrl || "Sin URL";

    let duracionFormateada = "Duración desconocida";
    if (song.duration) {
      const dur = parseInt(song.duration);
      if (!isNaN(dur) && dur> 0) {
        const min = Math.floor(dur / 60000);
        const seg = Math.floor((dur % 60000) / 1000);
        duracionFormateada = `${min}:${String(seg).padStart(2, "0")}`;
}
}

    const description = `╭─⬣「 *Barboza-Ai* 」⬣
│  ≡◦ 🎵 *Título:* ${title}
│  ≡◦ 🎤 *Artista(s):* ${artists}
│  ≡◦ ⏱ *Duración:* ${duracionFormateada}
│  ≡◦ 👀 *Vistas:* ${views.toLocaleString()}
│  ≡◦ 📅 *Publicado:* ${ago}
│  ≡◦ 🔗 *URL:* ${videoUrl}
╰─⬣
> © Powered By Barboza™`;

    await conn.sendMessage(m.chat, { text: description}, { quoted: m});

    await conn.sendMessage(m.chat, {
      audio: { url: song.downloadUrl},
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
}, { quoted: m});

    await m.react('✅');
} catch (error) {
    console.error(error);
    m.reply("⚠️ Hubo un error al procesar tu búsqueda. Intenta nuevamente más tarde.");
}
};

handler.help = ['spotify <nombre de canción>'];
handler.tags = ['descargas'];
handler.command = ['spotify'];

export default handler;