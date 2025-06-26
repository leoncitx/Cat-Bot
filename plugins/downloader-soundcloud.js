
import axios from 'axios';

let handler = async (m, { conn, args, usedPrefix, command}) => {
  if (!args[0]) throw `✧ Ejemplo de uso:\n${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`;

  await conn.sendMessage(m.chat, { react: { text: '🎶', key: m.key}});

  try {
    const { data} = await axios.get(`https://www.apis-anomaki.zone.id/downloader/yta?url=${encodeURIComponent(args[0])}`);

    if (!data?.result?.link) throw '❌ No se pudo obtener el audio.';

    const caption = `
*🌸 AUDIO DESCARGADO 🌸*

▢ 🎵 *Título:* ${data.result.title || 'desconocido'}
▢ ⏱️ *Duración:* ${data.result.duration || 'desconocida'}
▢ 📎 *Tipo:* ${data.result.ext || 'mp3'}

Pedido por: @${m.sender.split('@')[0]}
URL: ${args[0]}
`.trim();

    await conn.sendMessage(m.chat, {
      audio: { url: data.result.link},
      mimetype: 'audio/mp4',
      fileName: `${data.result.title || 'audio'}.mp3`,
      ptt: false,
}, { quoted: m});

    await m.reply(caption, null, { mentions: [m.sender]});
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key}});

} catch (err) {
    console.error(err);
    await m.reply('🚫 Ocurrió un error al intentar descargar el audio.');
}
};

handler.help = ['play'].map(v => v + ' <url>');
handler.tags = ['downloader'];
handler.command = /^play$/i;

export default handler;