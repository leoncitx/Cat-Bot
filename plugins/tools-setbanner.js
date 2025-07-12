
import fs from 'fs';
import path from 'path';
import { fileTypeFromBuffer} from 'file-type';

let handler = async (m, { conn, isRowner}) => {
  if (!m.quoted ||!/image/.test(m.quoted.mimetype)) {
    return m.reply(`📸 Por favor, responde a una imagen con el comando *setbanner* para actualizar la foto del menú.`);
}

  try {
    const media = await m.quoted.download();
    const type = await fileTypeFromBuffer(media);

    if (!type ||!['image/jpeg', 'image/png', 'image/gif'].includes(type.mime)) {
      return m.reply(`⚠️ El archivo enviado no es una imagen válida.`);
}

    const filename = path.join(global.__dirname || process.cwd(), './src/banner.jpg');

    fs.writeFileSync(filename, media); // Guarda la imagen localmente

    global.banner = filename; // Asigna la ruta del archivo como nuevo banner

    m.reply(`✅ La imagen del menú ha sido actualizada correctamente.`);

} catch (error) {
    console.error('[ERROR EN setbanner]', error);
    m.reply(`❌ Hubo un error al intentar cambiar el banner.\nDetalles: ${error.message}`);
}
};

handler.help = ['setbanner'];
handler.tags = ['tools'];
handler.command = ['setbanner'];

export default handler; 