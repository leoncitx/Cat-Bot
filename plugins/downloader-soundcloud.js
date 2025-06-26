import axios from 'axios';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Verifica si se proporcionó una URL
  if (!args[0]) {
    throw `✧ Ejemplo de uso:\n${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
  }

  // Envía una reacción de "música" mientras se procesa la solicitud
  await conn.sendMessage(m.chat, { react: { text: '🎶', key: m.key } });

  try {
    // Realiza la solicitud a la API para descargar el audio
    const { data } = await axios.get(`https://www.apis-anomaki.zone.id/downloader/yta?url=${encodeURIComponent(args[0])}`);

    // Verifica si la API devolvió un enlace de audio válido
    if (!data?.result?.link) {
      throw '❌ No se pudo obtener el audio. Asegúrate de que la URL sea válida y el video esté disponible.';
    }

    // Construye el mensaje de la leyenda con la información del audio
    const caption = `
*🌸 AUDIO DESCARGADO 🌸*

▢ 🎵 *Título:* ${data.result.title || 'Desconocido'}
▢ ⏱️ *Duración:* ${data.result.duration || 'Desconocida'}
▢ 📎 *Tipo:* ${data.result.ext || 'mp3'}

Pedido por: @${m.sender.split('@')[0]}
URL: ${args[0]}
`.trim();

    // Envía el archivo de audio al chat
    await conn.sendMessage(m.chat, {
      audio: { url: data.result.link },
      mimetype: 'audio/mp4',
      fileName: `${data.result.title || 'audio'}.mp3`,
      ptt: false, // Puedes cambiar esto a true si quieres que se envíe como mensaje de voz
    }, { quoted: m });

    // Envía la leyenda después de enviar el audio
    await m.reply(caption, null, { mentions: [m.sender] });

    // Envía una reacción de "verificado" al finalizar
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (err) {
    console.error('Error al descargar el audio:', err); // Imprime el error completo para depuración
    // Mensaje de error más amigable para el usuario
    await m.reply('🚫 Ocurrió un error al intentar descargar el audio. Por favor, verifica la URL e intenta de nuevo.');
  }
};

handler.help = ['play <url>'];
handler.tags = ['downloader'];
handler.command = /^play$/i;

export default handler;
