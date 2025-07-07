import { areJidsSameUser } from '@whiskeysockets/baileys';

export async function before(m, { participants, conn }) {
    // Si no es un grupo, no hacemos nada.
    if (!m.isGroup) return false;

    // Obtenemos la configuración del chat, si no está activado antiBot2, salimos.
    let chat = global.db.data.chats[m.chat] || {};
    if (!chat.antiBot2) return false;

    try {
        // Verificamos que conn.user y conn.user.jid estén definidos para evitar errores.
        if (!conn.user || !conn.user.jid) {
            console.error('Error: conn.user o conn.user.jid no definido en _antibot2.js');
            return true; // Indicamos que el plugin manejó el evento.
        }

        // Obtenemos el JID del bot principal. Asumimos que está en global.conn.user?.jid.
        let botJid = global.conn.user?.jid;
        if (!botJid) {
            console.error('Error: global.conn.user.jid no definido en _antibot2.js');
            return true; // Indicamos que el plugin manejó el evento.
        }

        // Comparamos los JIDs para ver si este es el bot principal. Si lo es, no hace nada.
        if (areJidsSameUser(botJid, conn.user.jid)) {
            return false; // Es el bot principal, no es necesario que se salga.
        }

        // Verificamos si el bot principal ya está en el grupo.
        let isBotPresent = participants.some(p => areJidsSameUser(botJid, p.id));
        if (isBotPresent) {
            // Si el bot principal está presente, este bot se saldrá del grupo después de 5 segundos.
            setTimeout(async () => {
                try {
                    await conn.reply(m.chat, `《✧》En este grupo está el bot principal, por lo que me saldré para no hacer spam.`, m);
                    await conn.groupLeave(m.chat);
                } catch (e) {
                    console.error('Error al intentar salir del grupo en _antibot2.js:', e);
                }
            }, 5000); // Espera 5 segundos antes de salir.
            return true; // Indicamos que el plugin manejó el evento.
        }

        return false; // Si el bot principal no está, continúa con el procesamiento normal.
    } catch (e) {
        console.error('Error en _antibot2.js:', e);
        return true; // Evita que un error detenga el bot.
    }
}
