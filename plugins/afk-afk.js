
const handler = async (m, { text}) => {
  const user = global.db.data.users[m.sender];

  if (!user) return; // Verifica que el usuario existe en la base de datos

  if (text) {
    user.afk = Date.now();
    user.afkReason = text;
    await m.reply(`🌙 *Modo AFK activado*\n📝 Motivo: ${text}`);
} else {
    user.afk = Date.now();
    user.afkReason = "Sin motivo especificado";
    await m.reply("🌙 *Modo AFK activado*\n📝 Motivo: Sin motivo especificado");
}
};

// Verifica si un usuario mencionado está en modo AFK y responde
handler.before = async function (m) {
  const mentionedUsers = m.mentionedJid || [];

  for (const mentioned of mentionedUsers) {
    const user = global.db.data.users[mentioned];

    if (user?.afk) {
      const timeAway = ((Date.now() - user.afk) / 1000).toFixed(0);
      await m.reply(`🚨 *El usuario está en modo AFK*\n🕒 Ausente por: ${timeAway} segundos\n📌 Motivo: ${user.afkReason}`);
}
}

  // Si el usuario envía un mensaje, se elimina su estado AFK
  const senderUser = global.db.data.users[m.sender];
  if (senderUser?.afk) {
    const timeAway = ((Date.now() - senderUser.afk) / 1000).toFixed(0);
    delete senderUser.afk;
    delete senderUser.afkReason;
    await m.reply(`✅ *Has salido del modo AFK*\n🕒 Estuviste ausente por: ${timeAway} segundos`);
}
};

handler.command = /^afk$/i;
handler.help = ['afk [motivo]'];
handler.tags = ['status'];
handler.money = 95;
handler.register = true;

export default handler;