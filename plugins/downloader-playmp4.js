import fetch from 'node-fetch';

let handler = async (m, { conn, args, text}) => {
  if (!args[0]) throw m.reply('Proporcione una consulta');

  const sender = m.sender.split('@')[0];

  // Obtener información de la API
  let ouh = await fetch(`https://fastrestapis.fasturl.cloud/downup/ytdown-v1?name=${text}&format=mp4&quality=720&server=auto`);
  let gyh = await ouh.json();

  const { duration, thumbnail, views, description, lengthSeconds, uploadDate} = gyh.result.metadata;
  const { author, name, bio, image, subCount} = gyh.result.author;
  const { url, format, quality, media, title} = gyh.result;

  m.reply('Procesando solicitud...');

  let textcap = `*YOUTUBE VIDEO DOWNLOADER*\n\n
  📌 *Título:* ${title}\n
  ⏳ *Duración:* ${lengthSeconds} segundos\n
  🎥 *Calidad:* ${quality}\n\n
  📝 *Descripción:*\n${description}\n\n> ${wm}`;

  // Enviar imagen y detalles primero
  await conn.sendMessage(
    m.chat,
    {
      image: { url: thumbnail},
      caption: textcap,
      mentions: [m.sender],
},
    { quoted: m}
);

  // Enviar el video como documento MP4 con el nombre de la música
  await conn.sendMessage(
    m.chat,
    {
      document: { url: media},
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`,
      caption: `📁 *Aquí está tu video en documento*`,
      mentions: [m.sender],
},
    { quoted: m}
);
};

handler.help = ['play2 <consulta>'];
handler.tags = ['downloader'];
handler.command = ["play2"];

export default handler;