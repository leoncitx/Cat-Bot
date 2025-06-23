export async function before(m, { conn, isOwner, isROwner }) {
    if (m.isBaileys && m.fromMe) return true;
    if (m.isGroup) return false;
    if (!m.message) return true;

    const botSettings = global.db.data.settings[this.user.jid] || {};
    const moroccoCountryCode = '212'; // Morocco's international dialing code

    if (botSettings.antiPrivate && !isOwner && !isROwner) {
        // Extract the recipient's phone number (m.sender) and check the country code
        // This is a simplified check and might need more robust logic
        if (m.sender.startsWith(moroccoCountryCode)) {
            await conn.updateBlockStatus(m.chat, 'block'); // Block the user
            console.log(`Usuario ${m.sender} bloqueado por contacto privado (Marruecos).`);
            return true; // Indicate that the block action was taken
        } else {
            // If it's not a Moroccan number, or if it's a known contact/other number, allow it
            console.log(`Usuario ${m.sender} permitido (no marroquí o contacto).`);
            return false;
        }
    }

    return false;
}
