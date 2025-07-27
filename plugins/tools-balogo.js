import { downloadContentFromMessage } from '@whiskeysockets/baileys'; // Podría ser necesaria esta importación

const handler = async (m, { conn }) => {
  try {
    const messageType = Object.keys(m.message)[0]; // Obtener el tipo de mensaje
    let buffer;

    if (messageType === 'imageMessage') {
      const stream = await downloadContentFromMessage(m.message.imageMessage, 'image');
      let chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      buffer = Buffer.concat(chunks);
    } else {
      return m.reply('❌ *Error:* Debes enviar una imagen junto con el comando `.setperfil`.');
    }

    // Actualizar la foto de perfil
    await conn.updateProfilePicture(conn.user.jid, buffer);

    m.reply('✅ *¡Imagen de perfil actualizada exitosamente!* 🖼️✨');

  } catch (error) {
    console.error(error);
    m.reply(`⚠️ *Error:* No se pudo actualizar la imagen de perfil. 🛑\n${error.message}`);
  }
};

handler.command = /^setperfil$/i;
handler.tags = ['Subbost'];
export default handler;
