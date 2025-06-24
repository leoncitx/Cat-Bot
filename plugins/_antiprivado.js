export async function before(m, { conn, isOwner, isROwner }) {
    if (m.isBaileys && m.fromMe) return true;
    if (m.isGroup) return false;.
    if (!m.message) return true;
    const senderJid = m.sender;

    if (!isOwner && !isROwner) {
        try {
            const contact = await conn.getContactById(senderJid;

            if (!contact || !contact.name || contact.name === senderJid.split('@')[0]) {
                await conn.updateBlockStatus(m.chat, 'block');
                console.log(`Usuario ${senderJid} bloqueado por contacto privado (no es un contacto conocido).`);
                return true;
            } else {
                console.log(`Usuario ${senderJid} permitido (es un contacto conocido: ${contact.name}).`);
                return false; 
            }
        } catch (error) {
             console.error(`Error al verificar contacto ${senderJid}:`, error);
            await conn.updateBlockStatus(m.chat, 'block');
            console.log(`Usuario ${senderJid} bloqueado por contacto privado (error al verificar o no conocido).`);
            return true;
        }
    }

    return false; }