import fetch from "node-fetch";
import yts from "yt-search";

const limit = 100;

const handler = async (m, { conn, text, command}) => {
  if (!text) return m.reply("🔍 *Escribe el nombre del video o pega un enlace de YouTube.*");

  m.react("🔄");

  const search = await yts(text);
  if (!search?.all?.length) return m.reply("❌ *No se encontraron resultados.*");

  const video = search.all[0];

  const info = `
╭━━━🎧 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗣𝗟𝗔𝗬 𝗕𝗢𝗧 🎬━━━╮
┃ 📌 *Título:* ${video.title}
┃ 🧑‍🎤 *Autor:* ${video.author.name}
┃ ⏱️ *Duración:* ${video.duration.timestamp}
┃ 👁️ *Vistas:* ${video.views.toLocaleString()}
┃ 🌐 *Enlace:* ${video.url}
╰━━━━━━━━━━━━━━━━━━━━━━╯
🎶 Descargando contenido solicitado...
  `.trim();

  await conn.sendFile(m.chat, await (await fetch(video.thumbnail)).buffer(), "thumb.jpg", info, m);

  try {
    if (command === "play") {
      const api = await (await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${video.url}`)).json();
      const audioUrl = api?.res?.url;
      if (!audioUrl) throw new Error("🎧 El enlace de audio no está disponible.");

      await conn.sendMessage(m.chat, {
        audio: { url: audioUrl},
        mimetype: "audio/mpeg",
        fileName: `${video.title}.mp3`
}, { quoted: m});

      await m.react("✅");
}

    if (command === "play2" || command === "playvid") {
      const api = await (await fetch(`https://api.sylphy.xyz/download/ytmp4?url=${video.url}`)).json();
      const videoUrl = api?.res?.url;
      if (!videoUrl) throw new Error("📹 El enlace de video no está disponible.");

      const response = await fetch(videoUrl);
      const size = parseInt(response.headers.get("Content-Length") || "0", 10) / (1024 * 1024);
      const asDoc = size>= limit;

      await conn.sendMessage(m.chat, {
        video: { url: videoUrl},
        mimetype: "video/mp4",
        caption: "📽️ Tu video está listo para ver o descargar",
        fileName: `${video.title}.mp4`,
...asDoc && { asDocument: true}
}, { quoted: m});

      await m.react("✅");
}
} catch (err) {
    console.error("❌ Error:", err.message);
    m.reply(`⚠️ *Error al procesar el archivo.*\n💬 Detalles: ${err.message}`);
}
};

handler.command = ["play", "play2"];
export default handler;