
const handler = async (m, { conn, text, command}) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `✳️ Usa: ${command} <nombre del video>`,
}, { quoted: m});
}

  // consumir directamente el API
  const api = `https://api.neoxr.eu/api/youtubeplay?query=${encodeURIComponent(text)}&type=audio&quality=128kbps&apikey=russellxz`;

  try {
    const res = await fetch(api).then(r => r.json());

    if (!res?.status ||!res.data?.url ||!res.data?.title ||!res.data?.thumbnail) {
      return conn.sendMessage(m.chat, {
        text: "❌ No se pudo obtener resultados válidos.",
}, { quoted: m});
}

    const { title, url, thumbnail, source, channel} = res.data;

    const caption = `
🎶 Título: ${title}
👤 Canal: ${channel}
🌐 Fuente: ${source}
🔗 Enlace: ${url}

🎧 Enviando audio...`.trim();

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail},
      caption,
}, { quoted: m});

    await conn.sendMessage(m.chat, {
      audio: { url},
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
}, { quoted: m});

} catch (e) {
    console.error(e);
    return conn.sendMessage(m.chat, {
      text: "⚠️ Ocurrió un error al procesar tu solicitud.",
}, { quoted: m});
}
};

handler.command = ["playlite", "mp3lite"];
handler.tags = ["downloader"];
handler.help = ["playlite <nombre>", "mp3lite <nombre>"];
handler.register = true;

export default handler;