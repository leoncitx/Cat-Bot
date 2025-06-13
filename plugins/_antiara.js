export async function before(m, { conn, isOwner, isROwner}) {
    if (m.isBaileys && m.fromMe) return true;
    if (m.isGroup) return false;
    if (!m.message) return true;

    const botSettings = global.db.data.settings[this.user.jid] || {};
    const blockedPrefixes = ['+212']; 
    if (botSettings.antiPrivate &&!isOwner &&!isROwner) {
        if (blockedPrefixes.some(prefix => m.sender.startsWith(prefix))) {
            await conn.updateBlockStatus(m.chat, 'block'); 
            console.log(`Usuario ${m.sender} bloqueado por prefijo prohibido.`);
}
}

    return false;
}