import { downloadContentFromMessage} from '@whiskeysockets/baileys';

const handler = async (m, { conn}) => {
  try {
    const mediaMsg = m.message?.imageMessage;
    if (!mediaMsg) {
      return m.reply('❌ Debes enviar una imagen junto con el comando `.setperfil`.');
}

    const stream = await downloadContentFromMessage(mediaMsg, 'image');
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
}

    const buffer = Buffer.concat(chunks);

    await conn.updateProfilePicture(conn.user.id, buffer);
    m.reply('✅ *Foto de perfil actualizada correctamente!* 🖼️');

} catch (err) {
    console.error(err);
    m.reply(`⚠️ No se pudo cambiar la imagen de perfil.\n${err.message}`);
}
};

handler.command = /^setperfil$/i;
handler.tags = ['perfil', 'admin'];
export default handler;