import yts from "yt-search";
import { ytv, yta} from "./_ytdl.js";

const limit = 100;
const handler = async (m, { conn, text, command}) => {
  if (!text) return m.reply("🌀 Por favor, ingresa el nombre de un video o una URL válida de YouTube.");
  m.react("💠");

  let res = await yts(text);
  if (!res ||!res.all || res.all.length === 0) {
    return m.reply("⚠️ No se encontraron resultados para tu búsqueda.");
}

  let video = res.all[0];
  let total = Number(video.duration.seconds) || 0;

  const cap = `
\`\`\`🌀──⌈ 🎧 Sasuke Bot MD ◞ ⌋──🌀\`\`\`

🌀 *Título:* ${video.title}
🌀 *Autor:* ${video.author.name}
🌀 *Duración:* ${video.duration.timestamp}
🌀 *Vistas:* ${video.views}
🌀 *URL:* ${video.url}

『 𝙋𝙤𝙩𝙚𝙣𝙘𝙞𝙖 𝙪𝙣𝙡𝙞𝙢𝙞𝙩𝙖𝙙𝙖 ⚡ - Sasuke Bot MD 』
`;

  await conn.sendFile(m.chat, await (await fetch(video.thumbnail)).buffer(), "image.jpg", cap, m);

  if (command === "play") {
    try {
      const api = await yta(video.url);
      await conn.sendFile(m.chat, api.result.download, api.result.title, "", m);
      await m.react("✅");
} catch (error) {
      return error.message;
}
} else if (command === "play2" || command === "playvid") {
    try {
      const api = await ytv(video.url);
      const res = await fetch(api.url);
      const cont = res.headers.get("Content-Length");
      const bytes = parseInt(cont, 10);
      const sizemb = bytes / (1024 * 1024);
      const doc = sizemb>= limit;
      await conn.sendFile(m.chat, api.url, api.title, "", m, null, {
        asDocument: doc,
        mimetype: "video/mp4",
});
      await m.react("✅");
} catch (error) {
      return error.message;
}
}
};

handler.help = ["play2"];
handler.tags = ["descargas"];
handler.command = ["play2", "playvid"];
export default handler;
