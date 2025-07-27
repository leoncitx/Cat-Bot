
import Jimp from 'jimp';

let handler = async (m, { conn}) => {
  const emojiOk = '✅';
  const emojiError = '⚠️';
  const emojiPhoto = '🖼️';
  const msgError = 'Ocurrió un problema al cambiar la foto de perfil.';

  // Verifica que el mensaje citado tenga imagen
  if (!m.quoted ||!/image/.test(m.quoted?.mimetype)) {
    return conn.reply(m.chat, `${emojiError} Responde a una imagen para establecerla como perfil.`, m);
}

  try {
    const media = await m.quoted.download();
    if (!media) return conn.reply(m.chat, `${emojiError} No se pudo descargar la imagen.`, m);

    const image = await Jimp.read(media);

    // 🔧 Procesamiento opcional
    image.resize(640, 640); // Redimensiona a tamaño recomendado
    image.brightness(0.1);  // Aumenta un poco el brillo

    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    await conn.updateProfilePicture(conn.user.id, buffer);

    conn.reply(m.chat, `${emojiOk} Foto de perfil actualizada correctamente ${emojiPhoto}`, m);
} catch (e) {
    console.error(e);
    conn.reply(m.chat, `${emojiError} ${msgError}`, m);
}
};

handler.help = ['setperfil'];
handler.tags = ['owner'];
handler.command = ['setperfil', 'perfil'];
handler.rowner = false;

export default handler;