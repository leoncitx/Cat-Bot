const axios = require("axios");
const yts = require("yt-search");

module.exports = async (msg, { conn, text}) => {
  if (!text) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "✳️ Usa: *.play <nombre de canción>*\nEj: *.play* Shakira - Hips Don’t Lie"
}, { quoted: msg});
}

  // Reacción de carga
  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "🔍", key: msg.key}
});

  // Buscar en YouTube
  const search = await yts(text);
  const video = search.videos[0];
  if (!video) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "❌ No se encontró ningún resultado."
}, { quoted: msg});
}

  const videoUrl = video.url;
  const title = video.title;

  // Llamar a la API externa
  const api = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&quality=128kbps&apikey=russellxz`;

  try {
    const res = await axios.get(api);
    const audioUrl = res.data?.data?.url;

    if (!audioUrl) throw new Error("Enlace inválido");

    await conn.sendMessage(msg.key.remoteJid, {
      audio: { url: audioUrl},
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      ptt: false
}, { quoted: msg});

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: "✅", key: msg.key}
});
} catch (err) {
    console.error("❌ Error al descargar audio:", err);
    await conn.sendMessage(msg.key.remoteJid, {
      text: "⚠️ No se pudo obtener el audio. Intenta más tarde o con otro título."
}, { quoted: msg});
}
};

module.exports.command = ["play"];