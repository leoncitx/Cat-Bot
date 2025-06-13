export async function before(m, { conn, isOwner, isROwner}) {
    if (m.isBaileys && m.fromMe) return true;
    if (m.isGroup) return false;
    if (!m.message) return true;

    const botSettings = global.db.data.settings[this.user.jid] || {};
    const bloqueados = ['+212'];

    if (botSettings.antiPrivate &&!isOwner &&!isROwner) {
        if (bloqueados.some(prefijo => m.sender.startsWith(prefijo))) {
            await conn.updateBlockStatus(m.chat, 'block');
            console.log(`Usuario ${m.sender} bloqueado automáticamente por prefijo +212.`);
}
}

    return false;
}