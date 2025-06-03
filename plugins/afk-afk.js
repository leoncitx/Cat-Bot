
const handler = async (m, { text}) => {
  const user = global.db.data.users[m.sender];

  user.afk = Date.now();
  user.afkReason = text || '😴 No especificado 💤';

  // Notificar que el usuario ha activado el modo AFK
  await m.reply(`✨ *MODO AFK ACTIVADO* ✨\n\n👤 Usuario: ${conn.getName(m.sender)}\n📝 Motivo: ${user.afkReason}\n⏳ No los etiquetes, está descansando... 😴`);

  conn.fakeReply(
    m.chat,
    `🚀 *ESTADO AFK* 🚀\n\n👤 *${conn.getName(m.sender)} está AFK!*\n📌 Motivo: ${user.afkReason}\n⏳ Está descansando, ¡no lo molestes! 🤫\n\n🔔 Etiquétalo cuando regrese para que sepa que lo mencionaste.`,
    '0@s.whatsapp.net',
    `🌙 MODO AFK ACTIVADO 🌙`,
    'status@broadcast',
    null,
    fake
);
};

// Manejo de usuarios en AFK cuando son mencionados
handler.before = async function (m) {
  const mentionedUsers = m.mentionedJid || [];

  for (const mentioned of mentionedUsers) {
    const user = global.db.data.users[mentioned];

    if (user?.afk) {
      const timeAway = ((Date.now() - user.afk) / 1000).toFixed(0);
      await m.reply(`🚨 *ATENCIÓN* 🚨\n\n👤 *${conn.getName(mentioned)} está en modo AFK!*\n⏳ Tiempo ausente: ${timeAway} segundos\n📌 Motivo: ${user.afkReason}\n\n⚠️ ¡Espera a que regrese antes de hablarle! 😉`);
}
}

  // Si el usuario envía un mensaje, se desactiva el modo AFK
  const senderUser = global.db.data.users[m.sender];
  if (senderUser?.afk) {
    const timeAway = ((Date.now() - senderUser.afk) / 1000).toFixed(0);
    delete senderUser.afk;
    delete senderUser.afkReason;
    await m.reply(`✅ *HAS SALIDO DEL MODO AFK* ✅\n\n👤 Usuario: ${conn.getName(m.sender)}\n⏳ Estuviste ausente por: ${timeAway} segundos\n🔔 ¡Bienvenido de nuevo! 🎉`);
}
};

handler.command = /^afk$/i;
handler.help = ['afk [motivo]'];
handler.tags = ['status'];
handler.money = 95;
handler.register = true;

export default handler;