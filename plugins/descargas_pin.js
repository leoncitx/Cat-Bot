
let handler = async (m, { conn, text, usedPrefix, command}) => {
  if (!text) throw `🌸 Uso correcto:\n${usedPrefix + command} <consulta>\n\nEjemplo:\n${usedPrefix + command} miku kawaii`;

  try {
    m.react('🔍');
    let url = `https://anime-xi-wheat.vercel.app/api/pinterest?q=${encodeURIComponent(text)}`;
    let res = await fetch(url);
    let data = await res.json();

    if (!data ||!data.status ||!data.result || data.result.length === 0) {
      throw `❌ No encontré imágenes para: *${text}*`;
}

    let image = data.result[Math.floor(Math.random() * data.result.length)];
    await conn.sendFile(m.chat, image, 'imagen.jpg', `🌸 Resultado para: *${text}*`, m);
} catch (e) {
    console.error(e);
    throw `⚠️ Hubo un error al obtener la imagen. Intenta con otra búsqueda.`;
}
};

handler.command = ['pin'];
export default handler;