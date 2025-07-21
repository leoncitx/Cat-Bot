
let handler = async (m, { conn}) => {
  let who = m.mentionedJid?.[0]
? m.mentionedJid[0]
: m.quoted
? m.quoted.sender
: m.sender;

  let nro = Math.floor(Math.random() * 101);
  let mensaje = `@${who.split("@")[0]} es ${nro}% Gay 🏳️‍🌈.`;

  await m.reply(mensaje, null, { mentions: [who]});

  try {
    await conn.sendMessage(m.chat, {
      audio: { url: 'https://qu.ax/grQGD.m4a'},
      mimetype: 'audio/mp3', // Prueba con audio/mp4 en lugar de audio/m4a
      ptt: true
}, { quoted: m});
} catch (e) {
    await m.reply('⚠️ No se pudo enviar el audio. Quizás el archivo no es compatible o el servidor lo bloquea.');
    console.error(e);
}
};