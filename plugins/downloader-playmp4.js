
import yts from "yt-search";

const LIMIT_MB = 100;
const API_KEY = "Sylphiette's";

const fetchVideoInfo = async (query) => {
  const res = await yts(query);
  return res?.all?.[0] || null;
};

const getDownloadLinks = (url) => ({
  audio: `https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(url)}&apikey=${API_KEY}`,
  video: `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&apikey=${API_KEY}`,
});

const handler = async (m, { conn, text, command}) => {
  if (!text) return m.reply("✨ Ingresa el nombre de un video o una URL de YouTube.");
  await m.react("🔎");

  const video = await fetchVideoInfo(text);
  if (!video) return m.reply("🚫 No encontré ningún resultado.");

  const caption = `
┌─「🎬 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗥𝗲𝘀𝘂𝗹𝘁𝗮𝗱𝗼」─┐
📌 *Título:* ${video.title}
👤 *Autor:* ${video.author.name}
⏰ *Duración:* ${video.duration.timestamp}
👁️‍🗨️ *Vistas:* ${video.views.toLocaleString()}
🔗 *Enlace:* ${video.url}
└────────────────────────┘
`;

  await conn.sendFile(m.chat, await (await fetch(video.thumbnail)).buffer(), "thumb.jpg", caption, m);

  const { audio, video: videoLink} = getDownloadLinks(video.url);

  try {
    if (command === "play") {
      const res = await (await fetch(audio)).json();
      if (!res.status) return m.reply("😢 No pude obtener el audio.");
      await conn.sendFile(m.chat, res.res.downloadURL, res.res.title + ".mp3", "", m);
} else if (["play2", "playvid"].includes(command)) {
      const res = await (await fetch(videoLink)).json();
      if (!res.status) return m.reply("😢 No pude obtener el video.");

      const head = await fetch(res.res.url, { method: "HEAD"});
      const sizeMB = parseInt(head.headers.get("content-length"), 10) / (1024 * 1024);
      const asDoc = sizeMB>= LIMIT_MB;

      await conn.sendFile(m.chat, res.res.url, res.res.title + ".mp4", "", m, null, {
        asDocument: asDoc,
        mimetype: "video/mp4",
});
}
    await m.react("✅");
} catch (err) {
    m.reply("💥 Ocurrió un error: " + err.message);
}
};

handler.help = ["play", "play2"];
handler.tags = ["download"];
handler.command = ["play", "play2", "playvid"];

export default handler;