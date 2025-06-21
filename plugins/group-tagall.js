
const handler = async (m, { isOwner, isAdmin, conn, text, participants, args }) => {
    // Solo administradores y el propietario pueden usar este comando
    if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn);
        return false;
    }

    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupName = groupMetadata.subject;
    const adminMessage = args.join(' ').trim(); // Mensaje opcional del admin

    // Configuración personalizable
    const config = {
        defaultEmoji: '📣', // Emoji por defecto para cada mención
        headerText: `*¡Atención, Grupo ${groupName}!*`,
        footerText: `\n--- Mensaje enviado por el bot ---`,
        callToAction: '\n\nPor favor, presten atención a este mensaje:',
        noMessageFallback: 'No se especificó un mensaje, pero aquí están todos los participantes:'
    };

    let messageContent = config.headerText;

    if (adminMessage) {
        messageContent += `${config.callToAction}\n\n"${adminMessage}"`;
    } else {
        messageContent += `\n\n${config.noMessageFallback}`;
    }

    messageContent += `\n\n*Participantes (${participants.length}):*\n`;

    const mentionedIds = [];
    for (const participant of participants) {
        messageContent += `${config.defaultEmoji} @${participant.id.split('@')[0]}\n`;
        mentionedIds.push(participant.id);
    }

    messageContent += config.footerText;

    await conn.sendMessage(m.chat, {
        text: messageContent,
        mentions: mentionedIds
    });

    return true; // Indica que el manejo fue exitoso
};

handler.help = ['atencion'];
handler.tags = ['group'];
handler.command = /^(hidetag|todos|mencionar)$/i; // Comandos que activan el handler
handler.admin = true;
handler.group = true;
export default handler;