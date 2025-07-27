const handler = async (m, { conn}) => {
  try {
    const attachment = (m.message?.imageMessage || {}).url || null;

    if (!attachment) {
      return m.reply('❌ *Error:* Debes enviar una imagen junto con el comando `.setperfil`.');
}

    // Descargar la imagen
    const buffer = await conn.downloadMediaMessage(m);

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