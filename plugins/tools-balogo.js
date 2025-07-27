import { downloadContentFromMessage} from '@whiskeysockets/baileys';

const handler = async (m, { conn}) => {
  try {
    // Asegurarse de que el mensaje contiene imagen
    const imageMessage = m.message?.imageMessage;
    if (!imageMessage) {
      return m.reply('❌ Debes enviar una imagen junto con el comando `.setperfil`.');
}

    // Descargar el contenido de la imagen
    const stream = await downloadContentFromMessage(imageMessage, 'image');
    const buffer = [];
    for await (const chunk of stream) {
      buffer.push(chunk);
}

    const fullBuffer = Buffer.concat(buffer);

    // Cambiar la foto de perfil del bot
    await conn.updateProfilePicture(conn.user.id, fullBuffer);

    m.reply('✅ *¡Foto de perfil actualizada con éxito!* 🖼️');

} catch (error) {
    console.error('Error al actualizar el perfil:', error);
    m.reply(`⚠️ No se pudo actualizar la foto de perfil.\n${error.message}`);
}
};

handler.command = /^setperfil$/i;
handler.tags = ['perfil'];
export default handler;
