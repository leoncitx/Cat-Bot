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

    const chat = global.db.data.chats?.[groupId] || {};

    if (!chat.antiOtherBots) {
        return;
    }

    console.log(`[AntiOtherBots] Detecting new participant(s) in group: ${groupId}`);

    for (const participantJid of participants) {
        const normalizedParticipantJid = jidNormalizedUser(participantJid);

        const isPermittedBot = JIDS_BOTS_PERMITIDOS.some(permittedJid =>
            areJidsSameUser(normalizedParticipantJid, permittedJid)
        );

        if (!isPermittedBot) {
            const botNumber = normalizedParticipantJid.split('@')[0];
            console.log(`⚠️ [AntiOtherBots] Unauthorized bot detected joining: ${botNumber} in group ${groupId}.`);

            try {
                await conn.sendMessage(groupId, { 
                    text: `🤖 ¡Alerta! Detecté un bot no autorizado (${botNumber}) uniéndose a este grupo. Lo expulsaré automáticamente para mantener el orden.`,
                    mentions: [normalizedParticipantJid] 
                });

                await conn.groupParticipantsUpdate(groupId, [normalizedParticipantJid], 'remove');

                console.log(`➡️ [AntiOtherBots] Bot ${botNumber} successfully expelled from group: ${groupId}.`);
            } catch (e) {
                console.error(`❌ Error [AntiOtherBots] trying to expel ${botNumber} from group ${groupId}:`, e);

                await conn.sendMessage(groupId, { 
                    text: `🚫 Atención: Intenté expulsar al bot no autorizado (${botNumber}) pero fallé, probablemente debido a que no tengo permisos de administrador en este grupo. Por favor, hazme administrador para que pueda proteger el grupo.`,
                    mentions: [normalizedParticipantJid] 
                });
            }
        } else {
            console.log(`✅ [AntiOtherBots] Permitted bot ${normalizedParticipantJid.split('@')[0]} joined group ${groupId}.`);
        }
    }
}
