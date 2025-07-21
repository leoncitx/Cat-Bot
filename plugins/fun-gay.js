let handler = async (m, { conn, groupMetadata}) => {
  let who = m.mentionedJid[0]
? m.mentionedJid[0]
: m.quoted
? m.quoted.sender
: m.sender;

  let nro = Math.floor(Math.random() * 101); // Valor entre 0 y 100
  let mensaje = `@${who.split("@")[0]} es ${nro}% Gay 🏳️‍🌈.`;

  await m.reply(mensaje, null, { mentions: [who]});

  // Envío del audio como nota de voz
  await conn.sendMessage(m.chat, {
    audio: { url: 'https://qu.ax/lQSxP.mp3'},
    mimetype: 'audio/mp4',
    ptt: true // Esto lo envía como nota de voz (push-to-talk)
}, { quoted: m});
};

handler.help = ['gay'];
handler.tags = ['fun'];
handler.command = ['cekgay', 'gay2'];
handler.group = true;

export default handler;