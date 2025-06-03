
const handler = (m) => m;

handler.afkUsers = {}; // Almacena los usuarios en modo AFK

handler.before = async function (m) {
  const id = m.sender;

  // Activar modo AFK
  if (m.text.startsWith('.afk')) {
    const reason = m.text.slice(5).trim() || 'Sin motivo especificado';
    this.afkUsers[id] = { reason, timestamp: Date.now()};
    return await m.reply(`🌙 *Modo AFK activado*\n📝 Motivo: ${reason}`);
}

  // Verificar si el usuario que envió el mensaje está en AFK y lo desactiva
  if (id in this.afkUsers) {
    const { reason, timestamp} = this.afkUsers[id];
    const timeAway = ((Date.now() - timestamp) / 1000).toFixed(0);
    delete this.afkUsers[id]; // Quitar estado AFK cuando el usuario envía mensaje
    await m.reply(`✅ *Has salido del modo AFK*\n🕒 Estuviste ausente por: ${timeAway} segundos\n📌 Motivo anterior: ${reason}`);
}

  // Comprobar si el mensaje menciona a alguien en modo AFK
  if (m.mentionedJid) {
    for (const mentioned of m.mentionedJid) {
      if (this.afkUsers[mentioned]) {
        const { reason, timestamp} = this.afkUsers[mentioned];
        const timeAway = ((Date.now() - timestamp) / 1000).toFixed(0);
        await m.reply(`🚨 *El usuario está en modo AFK*\n🕒 Ausente por: ${timeAway} segundos\n📌 Motivo: ${reason}`);
}
}
}

  return true;
};

handler.exp = 0;
export default handler;