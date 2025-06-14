
export async function before(m, { conn, isOwner, isROwner, isMods}) {
  if (m.isGroup ||!m.message) return false;

  const bot = global.db.data.settings[this.user.jid] || {};
  const senderNumber = m.sender.split('@')[0];

  // Lista de prefijos prohibidos
  const forbiddenPrefixes = ["212", "265", "234", "258", "263", "93", "967", "92", "254", "213", "505"];

  if (bot.antiPrivate2 &&!isOwner &&!isROwner &&!isMods) {
    const isForbiddenPrefix = forbiddenPrefixes.some(prefix => senderNumber.startsWith(prefix));

    if (isForbiddenPrefix) {
      await conn.sendMessage(m.chat, { text: `🚫 @${senderNumber}, no está permitido escribir al bot en privado.`, mentions: [m.sender]}, { quoted: m});
      await conn.updateBlockStatus(m.sender, 'block');
      console.log(`Bloqueo automático activado: ${senderNumber}`);
      return true;
}
}

  return false;
}