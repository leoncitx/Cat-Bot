
export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, isMods}) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup) return false;
  if (!m.message) return true;

  const bot = global.db.data.settings[this.user.jid] || {};
  const senderNumber = m.sender.split('@')[0];

  // Prefijos prohibidos
  const forbiddenPrefixes = ["212", "265", "234", "258", "263", "93", "967", "92", "254", "213", "505"];

  if (bot.antiPrivate2 &&!isOwner &&!isROwner &&!isMods) {
    const isForbiddenPrefix = forbiddenPrefixes.some(prefix => senderNumber.startsWith(prefix));

    if (isForbiddenPrefix) {
      await m.reply(`🚫 @${senderNumber}, no está permitido escribir en privado al bot.`, false, { mentions: [m.sender]});
      await this.updateBlockStatus(m.chat, 'block');
      console.log(`Usuario bloqueado por prefijo prohibido: ${senderNumber}`);
      return true;
}
}

  return false;
}