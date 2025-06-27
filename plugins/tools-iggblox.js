import fetch from 'node-fetch';

const handler = async (m, { conn, args}) => {
  if (!args.length) {
    return m.reply('📸 Escribe el texto para generar tu imagen.\n*Ejemplo:* `.imgg un dragón en un mundo cyberpunk`');
}

  const prompt = args.join(' ');
  const apiUrl = `https://api.nekorinn.my.id/ai-img/imagen?text=${encodeURIComponent(prompt)}`;

  try {
    m.reply('🎨 Generando tu imagen, por favor espera...');

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Respuesta inválida: ${res.statusText}`);

    const buffer = await res.buffer();
    await conn.sendFile(m.chat, buffer, 'imagen.jpg', `🖼️ *Imagen para:* _${prompt}_`, m);
} catch (e) {
    console.error('Error generando la imagen:', e);
    m.reply('🚧 Hubo un problema generando la imagen. Intenta de nuevo más tarde.');
}
};

handler.command = ['iggblox'];
export default handler;