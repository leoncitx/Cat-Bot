
import fetch from 'node-fetch';

let handler = async (m, { conn, text}) => {
  if (!text) return m.reply(`💨 Por favor, ingresa el nombre de una canción de Spotify.\n\nEjemplo:\n.spotify shape of you`);

  await m.react('🕒');

  try {
    const res = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status ||!json.result?.downloadUrl) {
      return m.reply("❌ No se pudo encontrar ni obtener la canción. Intenta con otro título.");
}

    const { title, artists, duration, downloadUrl} = json.result;

    const duracionMs = parseInt(duration);
    const minutos = Math.floor(duracionMs / 60000);
    const segundos = ((duracionMs % 60000) / 1000).toFixed(0);
    const duracionFormateada = `${minutos}:${segundos.padStart(2, '0')}`;

    await conn.sendMessage(m.chat, {
      text: `🎵 *Canción encontrada*:

📛 *Título:* ${title}
🎤 *Artista:* ${artists?.join(", ") || "Desconocido"}
⏱️ *Duración:* ${duracionFormateada}

🔊 Enviando audio...`,
}, { quoted: m});

    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl},
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
}, { quoted: m});

    await m.react('✅');
} catch (error) {
    console.error(error);
    m.reply("⚠️ Ocurrió un error al intentar obtener el audio. Intenta más tarde.");
}
};

handler.help = ['spotify <texto>'];
handler.tags = ['descargas'];
handler.command = ['spotify'];

export default handler;