
import axios from 'axios';
import yts from 'yt-search';

let handler = async (m, { conn, args, usedPrefix, command}) => {
  if (!args[0]) {
    throw `✧ Ejemplo de uso:\n${usedPrefix + command} Joji - Glimpse of Us`;
}

  await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key}});

  try {
    // Búsqueda del video en YouTube
    const search = await yts(args.join(" "));
    const video = search.videos[0];
    if (!video) throw '❌ No se encontraron resultados para tu búsqueda.';

    const videoUrl = video.url;

    // Solicitud a la API con la URL encontrada
    const { data} = await axios.get(`https://www.apis-anomaki.zone.id/downloader/yta?url=${encodeURIComponent(videoUrl)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0'}
});

    if (!data?.result?.link) throw '❌ No se pudo obtener el audio desde la API.';

    const ext = data.result.ext || 'mp3';
    const mimeType = ext === 'mp3'? 'audio/mpeg': 'audio/mp4';

    const caption = `
*🌸 AUDIO DESCARGADO 🌸*

▢ 🎵 *Título:* ${data.result.title || video.title}
▢ ⏱️ *Duración:* ${data.result.duration || video.timestamp}
▢ 📎 *Tipo:* ${ext}

Pedido por: @${m.sender.split('@')[0]}
🔗 URL: ${videoUrl}
`.trim();

    await conn.sendMessage(m.chat, {
      audio: { url: data.result.link},
      mimetype: mimeType,
      fileName: `${data.result.title || video.title}.${ext}`,
      ptt: false
}, { quoted: m});

    await m.reply(caption, null, { mentions: [m.sender]});
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key}});

} catch (err) {
    console.error('❌ Error:', err);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key}});
    await m.reply('🚫 Hubo un error buscando o descargando el audio. Intenta con otro título o más específico.');
}
};

handler.help = ['play <título>'];
handler.tags = ['downloader'];
handler.command = /^play$/i;

export default handler;