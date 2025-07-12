
import { downloadContentFromMessage} from '@whiskeysockets/baileys';

const handler = async (m, { conn}) => {
  try {
    // Validar que se haya citado una imagen
    const quotedMsg = m.quoted?.message?.imageMessage || m.quoted?.message;
    if (!m.quoted ||!quotedMsg ||!m.quoted.mimetype ||!m.quoted.mimetype.startsWith('image/')) {
      return m.reply('❌ *Error:* Responde a una imagen con el comando `.setmenu` para cambiar la imagen del menú.');
}

    // Descargar la imagen en forma de Buffer
    const stream = await downloadContentFromMessage(quotedMsg, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
}

    // Asignar imagen al menú
    global.menuImage = buffer;

    // Confirmar la acción
    m.reply('✅ *¡Imagen del menú cambiada con éxito!* 😃');

    // Mostrar imagen actualizada como vista previa
    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: '📌 *Nueva imagen del menú aplicada correctamente.*',
});

} catch (error) {
    console.error('[ERROR en.setmenu]', error);
    m.reply(`⚠️ *Error:* No se pudo aplicar la nueva imagen del menú.\nDetalles: ${error.message}`);
}
};

handler.command = /^setmenu$/i;
export default handler;