
import fs from 'fs';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command}) => {
  if (command === 'apk' && text) {
    const reactionMessage = await conn.sendMessage(
      m.chat,
      { text: `🔍 Buscando la aplicación...`},
      { quoted: m}
);
    await conn.sendMessage(
      m.chat,
      { react: { text: '📱', key: reactionMessage.key}},
      { quoted: m}
);

    try {
      const response = await fetch(`https://delirius-apiofc.vercel.app/download/apk?query=${encodeURIComponent(text)}`);
      const data = await response.json();
      if (!data.status ||!data.data) throw new Error("No se encontró la aplicación.");

      const app = data.data;

      const downloadUrl = app.download;
      await conn.sendMessage(
        m.chat,
        {
          document: { url: downloadUrl},
          mimetype: "application/vnd.android.package-archive",
          fileName: `${app.name}.apk`,
          caption: `✅ *${app.name}*\nTu APK ha sido descargada automáticamente.`
},
        { quoted: m}
);
} catch (error) {
      console.error("❌ Error:", error);
      await conn.sendMessage(
        m.chat,
        { react: { text: '❌', key: reactionMessage.key}},
        { quoted: m}
);
      await conn.sendMessage(
        m.chat,
        { text: `❌ Ocurrió un error: ${error.message || "Error desconocido"}`},
        { quoted: m}
);
}
    return;
}

  if (command === 'apk' &&!text) {
    return conn.sendMessage(
      m.chat,
      { text: `❗ Ingresa un término de búsqueda.\nEjemplo: ${usedPrefix}apk WhatsApp`},
      { quoted: m}
);
}
};

handler.command = /^(apk)$/i;
export default handler;