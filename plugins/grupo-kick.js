let handler = async (m, { conn, participants, isBotAdmin, isAdmin, args}) => {
  if (!m.isGroup) return m.reply('❗ *Este comando solo funciona en grupos.*');
  if (!isAdmin) return m.reply('🚫 *Solo los admins pueden usar este comando, fiera.*');
  if (!isBotAdmin) return m.reply('😥 *No puedo eliminar a nadie si no soy admin.*');

  let users = [];

  if (m.mentionedJid?.length) {
    users = m.mentionedJid;
} else if (m.quoted?.sender) {
    users = [m.quoted.sender];
} else if (args[0]) {
    let raw = args[0].replace(/[^0-9]/g, '');
    let jid = raw + '@s.whatsapp.net';
    users = [jid];
}

  if (!users.length) {
    return m.reply('👀 *Etiqueta o responde al mensaje de quien quieras eliminar, no adivino...*');
}

  let lid = participants.map(p => p.id); // Lista de IDs en el grupo

  for (let jid of users) {
    let normalizedJid = jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    if (normalizedJid === conn.user.jid) {
      m.reply(`😅 *¿Quieres que me elimine a mí mismo? Eso no se puede.*`);
      continue;
}

    if (!lid.includes(normalizedJid)) {
      m.reply(`🤔 *No encontré a @${normalizedJid.split('@')[0]} en este grupo...*`, null, {
        mentions: [normalizedJid],
});
      continue;
}

    await conn.groupParticipantsUpdate(m.chat, [normalizedJid], 'remove');
    await m.reply(`👢 *@${normalizedJid.split('@')[0]} fue enviado a volar del grupo...*\n\n✨ _Desarrollado por Barboza🌀_`, null, {
      mentions: [normalizedJid],
});
}

  m.react('✅');
};

handler.help = ['kick', 'ban'];
handler.tags = ['group'];
handler.command = /^(kick|ban|echar|sacar)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;