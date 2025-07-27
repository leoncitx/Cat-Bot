import Jimp from 'jimp';

let handler = async (m, { conn }) => {
  const emojiOk = '✅';
  const emojiError = '⚠️';
  const emojiPhoto = '🖼️';
  const msgError = 'Ocurrió un problema al cambiar la foto de perfil.';

  // Ensure a quoted message exists and it's an image
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image/')) {
    return conn.reply(m.chat, `${emojiError} Responde a una imagen para establecerla como perfil.`, m);
  }

  try {
    // Download the media from the quoted message
    const media = await m.quoted.download();
    if (!media) {
      console.error("Failed to download image from quoted message.");
      return conn.reply(m.chat, `${emojiError} No se pudo descargar la imagen.`, m);
    }

    // Use Jimp to read and process the image
    const image = await Jimp.read(media);

    // Optional: Resize and adjust brightness
    // Common profile picture sizes are often square, e.g., 640x640 or 128x128
    image.resize(640, 640);
    // You might want to be careful with brightness adjustments,
    // or make them optional/configurable.
    // image.brightness(0.1);

    // Get the image buffer in JPEG format
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // Update the bot's profile picture
    // Ensure 'conn.user.id' is the correct property for the bot's JID/ID
    if (!conn.user || !conn.user.id) {
        console.error("Bot's user ID (conn.user.id) is not available.");
        return conn.reply(m.chat, `${emojiError} No se pudo obtener la ID del bot para actualizar el perfil.`, m);
    }
    
    await conn.updateProfilePicture(conn.user.id, buffer);

    conn.reply(m.chat, `${emojiOk} Foto de perfil actualizada correctamente ${emojiPhoto}`, m);

  } catch (e) {
    // Log the full error for debugging
    console.error("Error al cambiar la foto de perfil:", e);
    conn.reply(m.chat, `${emojiError} ${msgError} Detalles: ${e.message || e}`, m); // Provide more detail to the user
  }
};

handler.help = ['setperfil'];
handler.tags = ['owner'];
handler.command = ['setperfil', 'perfil'];
handler.rowner = false; // This implies only the owner can use it, which is good for this command.

export default handler;
