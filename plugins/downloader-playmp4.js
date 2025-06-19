import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) throw m.reply(`✧ Ejemplo: ${usedPrefix}${command} Waguri Edit`);

  const wx = 'By Criss';

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key }});

  const results = await yts(text);

  if (!results.videos.length) throw m.reply('⚠️ No se encontraron resultados.');
  const tes = results.videos[0];

  const apiUrl = `https://www.apis-anomaki.zone.id/downloader/ytv?url=${encodeURIComponent(tes.url)}`;

  const respuesta = await fetch(apiUrl);
  const keni = await respuesta.json();

  if (!keni.status || !keni.result || !keni.result.formats || !keni.result.formats.length) {
    throw m.reply('⚠️ La API no devolvió resultados válidos.');
  }

  const { url, qualityLabel, fps } = keni.result.formats[0];
  const title = keni.result.title || 'video';

  if (!url) throw m.reply('⚠️ No se pudo obtener el enlace de descarga.');

  const caption = `
*💮 PLAY VIDEO 💮*

✧ : \`titulo;\` ${tes.title || 'no encontrado'}
✧ : \`duracion;\` ${tes.duration || 'no encontrado'}
✧ : \`calidad;\` ${qualityLabel || 'no encontrado'}
✧ : \`fps;\` ${fps || 'no encontrado'}

> ${wx}
> Pedido de @${m.sender.split('@')[0]}`;

  await conn.sendMessage(m.chat, {
    video: { url },
    mimetype: "video/mp4",
    fileName: `${title}.mp4`,
    caption,
    mentions: [m.sender]
  }, { quoted: m });

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }});
};

handler.help = ['playvideo *<consulta>*'];
handler.tags = ['descargas'];
handler.command = /^(playvideo|playvid)$/i;

export default handler;