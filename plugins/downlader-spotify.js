
import fetch from 'node-fetch';

let handler = async (m, { conn, text}) => {
  if (!text) {
    return m.reply(`💨 Por favor, ingresa el nombre de una canción de Spotify.\n\nEjemplo:\n.spotify shape of you`);
}

  await m.react('🕒');

  try {
    const res = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status ||!json.result?.downloadUrl) {
      return m.reply("❌ No se pudo encontrar ni obtener la canción. Intenta con otro título.");
}

    const song = json.result;
    const title = song?.title || "Sin título";
    const artists = Array.isArray(song?.artists)? song.artists.join(", "): "Artista desconocido";

    // Si duración viene como string "mm:ss", se respeta; si es en milisegundos, se convierte
    let duracionFormateada = "Duración desconocida";
    if (song?.duration) {
      const dur = isNaN(song.duration)? song.duration: parseInt(song.duration);
      if (typeof dur === 'string') {
        duracionFormateada = dur;
} else if (!isNaN(dur)) {
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
    m.reply("⚠️ Hubo un error al procesar tu búsqueda. Intenta de nuevo más tarde.");
}
};

handler.help = ['spotify <nombre de canción>'];
handler.tags = ['descargas'];
handler.command = ['spotify'];

export default handler;