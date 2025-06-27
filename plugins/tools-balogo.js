import fetch from 'node-fetch';

const handler = async (m, { conn, args}) => {
  if (!args.length) {
    return m.reply('✍️ Escribe el texto que deseas colocar en el logo.\n*Ejemplo:* `.balogo Kivoto Design`');
}

  const text = args.join(' ');
  const apiUrl = `https://api.nekorinn.my.id/maker/blue-archive-logo?text=${encodeURIComponent(text)}`;

  try {
    m.reply('📐 Ajustando los últimos detalles... tu logo estará listo en breve.');

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Respuesta inválida: ${res.statusText}`);

    const buffer = await res.buffer();
    await conn.sendFile(m.chat, buffer, 'balogo.jpg', `✅ Aquí está tu logo con el texto: _${text}_`, m);
} catch (err) {
    console.error('Error generando logo:', err);
    m.reply('⛔ No se pudo generar el logo en este momento. Intenta de nuevo más tarde con otro texto.');
}
};

handler.command = ['balogo'];
export default handler;