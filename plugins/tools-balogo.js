import jimp from "jimp"
 
let handler = async (m, { conn, usedPrefix, command, args, isOwner }) => {
  try {
    let quotedMsg = m.quoted ? m.quoted : m
    if (!m.quoted) return m.reply(`*⚠️ Responde a una Imagen.*`)

    let mediaType = (quotedMsg.type || quotedMsg).mimetype || '';
    var media = await quotedMsg.download();

    async function processImage(media) {
      const image = await jimp.read(media);
      const resizedImage = image.getWidth() > image.getHeight()
        ? image.resize(720, jimp.AUTO)
        : image.resize(jimp.AUTO, 720);
      return { img: await resizedImage.getBufferAsync(jimp.MIME_JPEG) }
    }

    var { img: processedImage } = await processImage(media);

    await conn.updateProfilePicture(conn.user.id, processedImage);

    m.react("✅️");
    await m.reply('✅ Foto de perfil del bot actualizada.');
    
  } catch (error) {
    console.log(error);
    m.react('❌');
  } 
};

handler.help = ['setppbot'];
handler.tags = ['owner'];
handler.command = /^setppbot$/i;
handler.owner = false;

export default handler;