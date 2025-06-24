export async function before(m, { conn, isOwner, isROwner }) {
    // Si el mensaje es del propio bot o viene de un grupo, no hacemos nada.
    if (m.isBaileys && m.fromMe) return true;
    if (m.isGroup) return false;
    // Si no hay un mensaje real, tampoco hacemos nada.
    if (!m.message) return true;

    // Obtenemos el ID del chat del remitente.
    const senderJid = m.sender;

    // Solo aplicamos esta lógica si el remitente NO es el propietario del bot.
    if (!isOwner && !isROwner) {
        try {
            // Intentamos obtener información del contacto.
            // Si el contacto no existe en la lista de contactos del bot, asumimos que no es un contacto guardado.
            const contact = await conn.getContactById(senderJid);

            // Si 'contact' es nulo o no tiene un nombre (lo que podría indicar que no es un contacto guardado),
            // o si el nombre del contacto es igual a su número (común en números no guardados),
            // entonces procedemos a bloquearlo.
            if (!contact || !contact.name || contact.name === senderJid.split('@')[0]) {
                await conn.updateBlockStatus(m.chat, 'block');
                console.log(`Usuario ${senderJid} bloqueado por contacto privado (no es un contacto conocido).`);
                return true; // Indicamos que la acción de bloqueo fue realizada.
            } else {
                console.log(`Usuario ${senderJid} permitido (es un contacto conocido: ${contact.name}).`);
                return false; // Es un contacto, lo permitimos.
            }
        } catch (error) {
            // Si ocurre un error al obtener el contacto (por ejemplo, si no lo encuentra),
            // podemos asumir que no es un contacto conocido y bloquearlo.
            console.error(`Error al verificar contacto ${senderJid}:`, error);
            await conn.updateBlockStatus(m.chat, 'block');
            console.log(`Usuario ${senderJid} bloqueado por contacto privado (error al verificar o no conocido).`);
            return true;
        }
    }

    return false; // Si es el propietario del bot, o si no se cumplen las condiciones anteriores, el mensaje pasa.
}
