import { areJidsSameUser, jidNormalizedUser } from '@whiskeysockets/baileys';

const JIDS_BOTS_PERMITIDOS = [
    '573244008977@s.whatsapp.net',
    '5491164352241@s.whatsapp.net',
    '5219921140671@s.whatsapp.net',
    '5219512757330@s.whatsapp.net',
    '51946359391@s.whatsapp.net' 
];

export async function participantsUpdate(conn, update) {
    const { id: groupId, participants, action } = update; 

    if (action !== 'add' || !groupId.endsWith('@g.us')) {
        return;
    }

    let chat = global.db.data.chats[groupId] || {};

    if (!chat.antiOtherBots) {
        return;
    }

    console.log(`[AntiOtherBots] Detectada nueva adición de participante(s) en el grupo: ${groupId}`);

    for (const participantJid of participants) {
        const normalizedParticipantJid = jidNormalizedUser(participantJid);

        const isPermittedBot = JIDS_BOTS_PERMITIDOS.some(permittedJid =>
            areJidsSameUser(normalizedParticipantJid, permittedJid)
        );

        if (!isPermittedBot) {
            console.log(`⚠️ [AntiOtherBots] Bot no autorizado detectado uniéndose: ${normalizedParticipantJid.split('@')[0]} en el grupo ${groupId}.`);
            try {
                await conn.sendMessage(groupId, { 
                    text: `🤖 ¡Alerta! Detecté un bot no autorizado (${normalizedParticipantJid.split('@')[0]}) uniéndose a este grupo. Lo expulsaré automáticamente para mantener el orden.`,
                    mentions: [normalizedParticipantJid] 
                });
                
                await conn.groupParticipantsUpdate(groupId, [normalizedParticipantJid], 'remove');
                
                console.log(`➡️ [AntiOtherBots] Bot ${normalizedParticipantJid.split('@')[0]} fue expulsado exitosamente del grupo: ${groupId}.`);
            } catch (e) {
                console.error(`❌ Error [AntiOtherBots] al intentar expulsar a ${normalizedParticipantJid.split('@')[0]} del grupo ${groupId}:`, e);
                
                await conn.sendMessage(groupId, { 
                    text: `🚫 Atención: Intenté expulsar al bot no autorizado (${normalizedParticipantJid.split('@')[0]}) pero fallé, probablemente debido a que no tengo permisos de administrador en este grupo. Por favor, hazme administrador para que pueda proteger el grupo.`,
                    mentions: [normalizedParticipantJid] 
                });
            }
        } else {
            
        }
    }
}
