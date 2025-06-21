
import fetch from 'node-fetch'; // Solo si estás en Node.js

let handler = async (m, { conn, text, usedPrefix, command}) => {
  if (!text) throw `🌸 Usa el comando así:\n${usedPrefix + command} miku kawaii`;

  try {
    const res = await fetch(`https://anime-xi-wheat.vercel.app/api/pinterest?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json ||!json.result ||!Array.isArray(json.result) || json.result.length === 0) {
      throw `❌ No se encontraron imágenes para: *${text}*`;
}

    const imageUrl = json.result[Math.floor(Math.random() * json.result.length)];

    await conn.sendFile(m.chat, imageUrl, 'pinterest.jpg', `✨ Resultado para: *${text}*`, m);
} catch (e) {
    console.error('[ERROR PINTEREST]', e);
    throw `⚠️ Hubo un error al obtener la imagen. Intenta con otra palabra o revisa la consola.`;
}
};

handler.command = ['pin'];
export default handler;