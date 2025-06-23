
let handler = async (m, { conn, args}) => {
  if (!args.length) {
    return m.reply('✳️ Escribe el texto que quieres que aparezca.\n\nEjemplo:\n.qc Hola, ¿cómo estás?');
}

  const texto = encodeURIComponent(args.join(' '));
  const name = encodeURIComponent('Diego');
  const avatar = encodeURIComponent('https://cdn.dorratz.com/files/1748229428360.jpg');
  const replyName = encodeURIComponent('test');
  const replyText = encodeURIComponent('Dorrat Api Es God?');
  const media = encodeURIComponent('https://cdn.dorratz.com/files/1748229428360.jpg');

  const url = `https://api.dorratz.com/v3/qc?name=${name}&text=${texto}&avatar=${avatar}&replyName=${replyName}&replyText=${replyText}&media=${media}`;

  try {
    await conn.sendMessage(m.chat, {
      image: { url},
      caption: '✅ Generado con Dorrat API'
}, { quoted: m});
} catch (e) {
    console.error(e);
    m.reply('⚠️ No se pudo generar la imagen. Intenta más tarde.');
}
};

handler.command = ['qc', 'cita', 'mensaje'];
handler.help = ['qc <texto>'];
handler.tags = ['tools'];
export default handler;