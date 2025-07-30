import Jimp from 'jimp';

let handler = async (m, { conn }) => {
  if (!m.quoted) return conn.reply(m.chat, `Por favor, responde a una imagen para cambiar la foto de perfil.`, m);

  try {
    const media = await m.quoted.download();
    if (!media) {
      console.error("No se pudo obtener la imagen del mensaje citado.");
      return conn.reply(m.chat, `No se pudo obtener la imagen.`, m);
    }

    const image = await Jimp.read(media);
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // Assuming 'baileys' and conn.user.id is the correct identifier for the bot's JID
    // If you're using another library, this line will likely need to change.
    await conn.updateProfilePicture(conn.user.id, buffer); // or conn.user.jid if your library expects that

    return conn.reply(m.chat, `Foto de perfil cambiada con éxito.`, m);
  } catch (e) {
    console.error("Error al intentar cambiar la foto de perfil:", e);
    return conn.reply(m.chat, `Ocurrió un error al intentar cambiar la foto de perfil: ${e.message || e}.`, m);
  }
};

handler.help = ['setimage'];
handler.tags = ['owner'];
handler.command = ['setpfp', 'setimage'];
handler.rowner = true;

export default handler;
