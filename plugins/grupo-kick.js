
const handler = async (msg, { conn}) => {
  if (!msg.key.remoteJid.includes("@g.us")) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: "❌ *Este comando solo funciona en grupos.*"
}, { quoted: msg});
}

  const metadata = await conn.groupMetadata(msg.key.remoteJid);
  const admins = metadata.participants.filter(p => p.admin);
  const isSenderAdmin = admins.some(a => a.id === msg.key.participant);

  if (!isSenderAdmin) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: "🚫 *No tienes permisos para expulsar usuarios.*"
}, { quoted: msg});
}

  // Detectar a quién expulsar: menciones o respuesta directa
  let target = null;
  const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (mention?.length) target = mention[0];
  else if (msg.message?.extendedTextMessage?.contextInfo?.participant)
    target = msg.message.extendedTextMessage.contextInfo.participant;

  if (!target) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: "⚠️ *Debes mencionar o responder a alguien para expulsarlo.*"
}, { quoted: msg});
}

  const isTargetAdmin = admins.some(a => a.id === target);
  if (isTargetAdmin) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: "❌ *No puedes expulsar a otro administrador.*"
}, { quoted: msg});
}

  // Enviar sticker antes de expulsar
  const sticker = await conn.getFile('https://n.uguu.se/OTTBjcpJ.webp');
  await conn.sendMessage(msg.key.remoteJid, {
    sticker: { url: sticker.url}
}, { quoted: msg});

  // Expulsar al usuario
  await conn.groupParticipantsUpdate(msg.key.remoteJid, [target], "remove");

  await conn.sendMessage(msg.key.remoteJid, {
    text: `🚷 *@${target.split("@")[0]} fue expulsado del grupo.*`,
    mentions: [target]
}, { quoted: msg});
};

handler.command = ["kick"];

export default handler;