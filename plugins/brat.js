
import fetch from "node-fetch";

/**
 * Código creado por Barboza
 */

const handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      return m.reply(`❌ Ingresa el texto para el sticker.\n\nEjemplo: *${usedPrefix + command} Barboza*`);
    }

    const text = encodeURIComponent(args.join(" "));
    const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${text}`;

    // React de carga
    await conn.sendMessage(m.chat, { react: { text: "🎨", key: m.key } });

    // Envío del sticker
    await conn.sendMessage(m.chat, { sticker: { url: apiUrl } }, { quoted: m });

    // React de éxito
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error("❌ Error al generar el sticker:", err);
    m.reply("❌ Ocurrió un error al generar el sticker. Inténtalo nuevamente.");
  }
};

handler.command = ["brat"];
export default handler;
