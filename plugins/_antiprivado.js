export async function before(m, { conn, isOwner, isROwner}) {
    if (m.isBaileys && m.fromMe) return true;
    if (m.isGroup) return false;
    if (!m.message) return true;

    // Extract the country code from the sender's JID
    const senderJID = m.sender;
    const countryCodeMatch = senderJID.match(/^(\d+)/); 
    const countryCode = countryCodeMatch ? countryCodeMatch[1] : null;

    // Check if the country code is 212 (Morocco)
    if (countryCode === '212') {
        if (!isOwner && !isROwner) { // Only block if the sender is not an owner
            await conn.updateBlockStatus(m.chat, 'block'); // Blocks the user without sending a message
            console.log(`User ${m.sender} from Morocco (212) blocked for private contact.`);
        }
        return true; // Return true to stop further processing for this message
    }

    const botSettings = global.db.data.settings[this.user.jid] || {};

    if (botSettings.antiPrivate && !isOwner && !isROwner) {
        await conn.updateBlockStatus(m.chat, 'block'); // Blocks the user without sending a message
        console.log(`User ${m.sender} blocked for private contact.`);
    }

    return false;
}
