
import { downloadContentFromMessage} from '@whiskeysockets/baileys';

const handler = async (m, { conn}) => {
  try {
    if (!m.quoted ||!m.quoted.mimetype ||!m.quoted.mimetype.startsWith('image/')) {
      return m.reply('❌ *Error:* Responde a una imagen con el comando `.setmenu` para cambiar la imagen del menú.');
}

    const media = await downloadContentFromMessage(m.quoted.message.imageMessage || m.quoted.message, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of media) {
      buffer = Buffer.concat([buffer, chunk]);
}

    // Guarda la imagen en una variable global para su uso futuro
    global.menuImage = buffer;

    m.reply('✅ *¡Imagen del menú cambiada con éxito!* 😃📸');

    // Enviar la imagen directamente usando el buffer
    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: '📌 *Nueva imagen del menú aplicada.*'
});

} catch (error) {
    console.error('[ERROR setmenu]', error);
    m.reply('⚠️ *Error:* No se pudo cambiar la imagen del menú.\n' + error.message);
}
};

handler.command = /^setmenu$/i;
export default handler;