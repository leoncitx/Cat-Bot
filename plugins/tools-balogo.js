let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted || !m.quoted.mime || !m.quoted.mime.startsWith('image/')) {
    return m.reply(`📸 *Envía una imagen con el comando o responde a una imagen.*\n\n📌 Ejemplo:\n${usedPrefix + command} (responde a una foto)`);
  }

  try {
    m.react('🖼️');

    let media = await m.quoted.download();
    if (!media) return m.reply('❗ No se pudo descargar la imagen.');

    await conn.updateProfilePicture(m.sender, media);
    m.reply('✅ Tu foto de perfil fue actualizada correctamente.');
  } catch (e) {
    console.error(e);
    m.reply('❌ Error al actualizar tu foto de perfil. Asegúrate de que el bot tenga permisos suficientes y que la imagen sea válida.');
  }
};

handler.command =[ 'setperfil'  'setpp' ]
handler.private = true;