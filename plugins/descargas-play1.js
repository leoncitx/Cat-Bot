import yts from "yt-search";
const limit = 100;

const handler = async (m, { conn, text, command}) => {
  if (!text) return m.reply("🌀 *Por favor ingresa el nombre de un video o una URL de YouTube.*");

  m.react("🔎");

  const res = await yts(text);
  if (!res?.all?.length) return m.reply("❌ *No se encontraron resultados para tu búsqueda.*");

  const video = res.all[0];
  const total = Number(video.duration.seconds) || 0;

  const cap = `
╭─━━━╮🎬 𝙔𝙊𝙐𝙏𝙐𝘽𝙀 𝙋𝙇𝘼𝙔 𝘽𝙊𝙏 ━━━─╮
│🔸 *Título:* ${video.title}
│🎙️ *Autor:* ${video.author.name}
│⏱️ *Duración:* ${video.duration.timestamp}
│👁️ *Vistas:* ${video.views.toLocaleString()}
│🌐 *Enlace:* ${video.url}
╰─━━━━━━━━━━━━━━━━━━━━━╯

🌀 *Tu contenido está listo para descargar.*
🪩 *Disfruta de música y video instantáneamente.*
`;

  await conn.sendFile(m.chat, await (await fetch(video.thumbnail)).buffer(), "thumb.jpg", cap, m);

  if (command === "play") {
    try {
      const api = await (await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${video.url}&apikey=Sylphiette's`)).json();
      await conn.sendFile(m.chat, api.res.url, `${video.title}.mp3`, "", m);
      await m.react("🎶");
} catch (error) {
      return m.reply("⚠️ *Hubo un error al descargar el audio.*");
}
} else if (command === "play2" || command === "playvid") {
    try {
      const api = await (await fetch(`https://api.sylphy.xyz/download/ytmp4?url=${video.url}&apikey=Sylphiette's`)).json();
      const dl = api.res.url;
      const res = await fetch(dl);
      const cont = res.headers.get("Content-Length");
      const bytes = parseInt(cont, 10);
      const sizemb = bytes / (1024 * 1024);
      const doc = sizemb>= limit;

      await conn.sendFile(m.chat, dl, `${video.title}.mp4`, "", m, null, {
        asDocument: doc,
        mimetype: "video/mp4"
});

      await m.react("🎥");
} catch (error) {
      return m.reply("⚠️ *No se pudo descargar el video.*");
}
}
};

handler.help = ["play1", "play3", "playvid"];
handler.tags = ["descargar", "youtube"];
handler.command = ["play1", "play3"];

export default handler;