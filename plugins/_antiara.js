let handler = async (m, { conn, usedPrefix, command, args}) => {
  const mediafireUrl = args[0];
  if (!mediafireUrl) {
    return conn.reply(m.chat, `🌀 *Por favor proporciona un enlace de Mediafire.*\n📌 *Ejemplo:* ${usedPrefix}${command} https://www.mediafire.com/file/abc123/archivo.zip/file`, m);
}

  if (!/^https:\/\/www\.mediafire\.com\//i.test(mediafireUrl)) {
    return conn.reply(m.chat, `❌ *Enlace inválido.* Asegúrate de que sea un enlace directo de Mediafire.`, m);
}

  try {
    m.react('🔄');
    const res = await fetch(`https://api.sylphy.xyz/download/mediafire?url=${mediafireUrl}&apikey-hola`);
    const json = await res.json();

    const file = json?.data;
    if (!file?.download) {
      return conn.reply(m.chat, `⚠️ *No se pudo recuperar el archivo.*`, m);
}

    const infoMsg = `
📥 **Archivo Descargado**
╭───────────────
│ 📄 *Nombre:* ${file.filename}
│ 📦 *Tamaño:* ${file.size}
│ 🔗 *Enlace:* ${mediafireUrl}
│ 🧾 *Tipo:* ${file.mimetype}
╰───────────────`;

    m.reply(infoMsg);
    await conn.sendFile(m.chat, file.download, file.filename, '', m);
} catch (err) {
    conn.reply(m.chat, `🚫 *Error al procesar el enlace:* ${err.message}`, m);
}
};

handler.command = handler.help = ['mediafire2', 'mf2'];
handler.tags = ['descargas'];
export default handler;