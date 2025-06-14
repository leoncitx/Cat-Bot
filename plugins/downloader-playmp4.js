
import fetch from 'node-fetch';
import yts from 'yt-search';

let handler = async (m, { conn, command, text, usedPrefix}) => {
  if (!text) throw m.reply(`✧ Ejemplo: ${usedPrefix}${command} Barboza Bot`);

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key}});

  let results = await yts(text);
  let tes = results.videos[0];

  const apiUrl = `https://www.apis-anomaki.zone.id/downloader/ytv?url=${encodeURIComponent(tes.url)}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const { url, qualityLabel, fps, contentLength} = data.result.formats[0];
    const { title} = data.result;

    if (!url) throw m.reply('⚠️ No hay respuesta de la API.');

    const caption = `🎬 *PLAY VIDEO*\n\n📌 *Título:* ${tes.title}\n⏳ *Duración:* ${tes.duration}\n🎥 *Calidad:* ${qualityLabel}\n⚡ *FPS:* ${fps}\n\n🔹 Pedido de @${m.sender.split('@')[0]}`;

    // Definir tamaño límite (30 MB)
    const maxSize = 30 * 1024 * 1024;
    const isHeavy = contentLength && parseInt(contentLength)> maxSize;

    if (isHeavy) {
      await conn.sendMessage(m.chat, {
        document: { url},
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption: `📁 *Aquí está tu video (archivo pesado)*`,
        mentions: [m.sender]
}, { quoted: m});
} else {
      await conn.sendMessage(m.chat, {
        video: { url},
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption,
        mentions: [m.sender]
}, { quoted: m});
}

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key}});

} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    await conn.sendMessage(m.chat, { text: '⚠️ Intente más tarde, el vídeo es muy pesado o hubo un error al procesarlo.', mentions: [m.sender]}, { quoted: m});
}
};

handler.help = ['play2 *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(playvideo|playvid)$/i;

handler.register = true;
handler.disable = false;

export default handler;