
import fetch from 'node-fetch';
import yts from 'yt-search';

let handler = async (m, { conn, command, text, usedPrefix}) => {
  if (!text) throw m.reply(`✧ Ejemplo: ${usedPrefix}${command} Barboza MD`);

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key}});

  let results = await yts(text);
  let tes = results.videos[0];

  const args = text.split(' ');
  const videoUrl = args[0];

  const apiUrl = `https://www.apis-anomaki.zone.id/downloader/ytv?url=${encodeURIComponent(tes.url)}`;

  try {
    const respuesta = await fetch(apiUrl);
    const keni = await respuesta.json();
    const { url, qualityLabel, fps} = keni.result.formats[0];
    const { title} = keni.result;

    if (!url) throw m.reply('⚠️ No hay respuesta de la API.');

    const caption = `
      *💮 PLAY VIDEO - Barboza MD 💮*

  ✧: \`título;\` ${tes.title || 'no encontrado'}
  ✧: \`duración;\` ${tes.duration || 'no encontrado'}
  ✧: \`calidad;\` ${qualityLabel || 'no encontrado'}
  ✧: \`fps;\` ${fps || 'no encontrado'}

> Pedido de @${m.sender.split('@')[0]}`;

    await conn.sendMessage(m.chat, {
      video: { url: url},
      mimetype: "video/mp4",
      fileName: title,
      caption,
      mentions: [m.sender]
}, { quoted: m});

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key}});

} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    await conn.sendMessage(m.chat, { react: { text: '❎', key: m.key}});
}
};

handler.help = ['play2 *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(play2|playvid)$/i;

handler.register = true;
handler.disable = false;

export default handler;