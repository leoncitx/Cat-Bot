
let handler = async (m, { conn, text, usedPrefix, command}) => {
  if (!text) {
    return conn.reply(m.chat, `❗ *Uso correcto:* ${usedPrefix + command} <enlace de YouTube>`, m);
}

  const apis = [
    `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(text)}`,
    `https://mahiru-shiina.vercel.app/download/ytmp3?url=${encodeURIComponent(text)}`,
    `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(text)}`
  ];

  let resultado;
  for (let url of apis) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      if (data && data.result?.url) {
        resultado = {
          titulo: data.result.title || "Sin título",
          urlAudio: data.result.url,
          autor: data.result.channel || "Desconocido",
          tamaño: data.result.size || "Desconocido",
          thumb: data.result.thumbnail || null
};
        break;
}
} catch (e) {
      console.error(`Error con API ${url}:`, e);
      continue;
}
}

  if (!resultado) {
    return conn.reply(m.chat, `❌ *Todas las APIs fallaron o el enlace no es válido.*`, m);
}

  let mensaje = `
🎵 *Título:* ${resultado.titulo}
📻 *Canal:* ${resultado.autor}
💾 *Tamaño:* ${resultado.tamaño}
`.trim();

  await conn.sendFile(m.chat, resultado.urlAudio, 'audio.mp3', mensaje, m, null, {
    asDocument: false,
    mimetype: 'audio/mp3'
});

  if (resultado.thumb) {
    await conn.sendFile(m.chat, resultado.thumb, 'thumb.jpg', '', m);
}
};

handler.command = ['ytmp3', 'play'];
handler.help = ['ytmp3 <link>', 'play <link>'];
handler.tags = ['downloader'];

export default handler;
