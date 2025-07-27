
import { downloadContentFromMessage} from '@whiskeysockets/baileys';

const handler = async (m, { conn}) => {
  try {
    // Verifica si el mensaje contiene imagen
    const imageMessage = m.message?.imageMessage;
    if (!imageMessage) {
      return m.reply('❌ Debes enviar una imagen junto con el comando `.setperfil`.');
}

    // Descarga el contenido de imagen en un stream
    const stream = await downloadContentFromMessage(imageMessage, 'image');
    const buffer = [];
    for await (const chunk of stream) {
      buffer.push(chunk);
}
    const fullImage = Buffer.concat(buffer);

    // Cambia la foto de perfil del bot
    await conn.updateProfilePicture(conn.user.id, fullImage);

    m.reply('✅ *Foto de perfil actualizada correctamente!* 🎉🖼️');

} catch (error) {
    console.error('🛑 Error al actualizar la foto:', error);
    m.reply(`⚠️ No se pudo actualizar la foto de perfil.\n${error.message}`);
}
};

handler.command = /^setperfil$/i;
handler.tags = ['perfil'];
export default handler;