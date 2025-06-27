import fetch from 'node-fetch';

const handler = async (m, { conn, args}) => {
  if (!args.length) {
    return m.reply('✏️ Escribe el texto que quieres usar en el logo.\n*Ejemplo:* `.balogo Asuna Project`');
}

  const text = args.join(' ');
  const apiUrl = `https://api.nekorinn.my.id/maker/blue-archive-logo?text=${encodeURIComponent(text)}`;

  try {
    m.reply('🛠️ Estamos preparando tu diseño... esto tomará solo un momento.');

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Error de respuesta: ${res.statusText}`);

    const buffer = await res.buffer();
    await conn.sendFile(m.chat, buffer, 'logo.jpg', `🖋️ *Diseño generado para:* _${text}_`, m);
} catch (err) {
    console.error('Error generando logo:', err);
    m.reply('📵 No pudimos generar tu diseño en este momento. Prueba más tarde con otro texto.');
}
};

handler.command = ['balogo'];
export default handler;