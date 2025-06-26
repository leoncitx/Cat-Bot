import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text, usedPrefix }) => {
  // Reacción de carga
  await conn.sendMessage(m.chat, {
    react: { text: "⚙️", key: m.key }
  });

  const fromMe = m.key.fromMe;
  if (!fromMe) {
    return await conn.sendMessage(m.chat, {
      text: "⛔ Solo el *dueño del subbot* puede usar este comando."
    }, { quoted: m });
  }

  // Validación del texto ingresado
  if (!text || text.length > 2) {
    return await conn.sendMessage(m.chat, {
      text: `⚠️ Usa el comando con el prefijo que desees (máx. 2 caracteres).\n\n✅ Ejemplo:\n${usedPrefix}setprefix 🩸`,
    }, { quoted: m });
  }

  // Obtener ID limpio del subbot
  const rawID = conn.user?.id || "";
  const subbotID = rawID.split(":")[0] + "@s.whatsapp.net";

  // Ruta del archivo de prefijos
  const filePath = path.resolve('./prefixes.json');
  let data = {};
  if (fs.existsSync(filePath)) {
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      data = {};
    }
  }

  // Guardar prefijo
  data[subbotID] = text;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  return await conn.sendMessage(m.chat, {
    text: `
╭─❒ 「 *✅ PREFIJO ACTUALIZADO* 」
│ Nuevo prefijo: *${text}*
│ Ejemplos válidos: 🩸👎🏻🫴🏻🤬🩸😘
╰❒
`.trim()
  }, { quoted: m });
};

handler.command = ['setprefix'];
handler.owner = true;

export default handler;