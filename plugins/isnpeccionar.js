let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Check if text (link) is provided
    if (!text) {
        return conn.reply(m.chat, `*Uso correcto:* ${usedPrefix}${command} <enlace de canal/grupo/comunidad>`, m);
    }

    // Regular expressions for WhatsApp channel, group, and community links
    const channelRegex = /https:\/\/whatsapp\.com\/channel\/([0-9A-Za-z]+)/i;
    const groupRegex = /(https:\/\/chat\.whatsapp\.com\/)([0-9A-Za-z]{22})/i;
    const communityRegex = /https:\/\/whatsapp\.com\/community\/([0-9A-Za-z]+)/i;

    // Attempt to match the provided text against the regex patterns
    let matchChannel = text.match(channelRegex);
    let matchGroup = text.match(groupRegex);
    let matchCommunity = text.match(communityRegex);

    // Handle Channel Information
    if (matchChannel) {
        const channelId = matchChannel[1]; // Extract channel ID
        try {
            // Assume conn.newsletterMetadata is the correct function for channel info
            const info = await conn.newsletterMetadata("invite", channelId);

            // Format creation date
            const creationDate = new Date(info.creation_time * 1000);
            const formattedDate = creationDate.toLocaleDateString("es-ES", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Construct and send channel information response
            let responseText = `
*╭┈┈┈「 🌿 Información del Canal 🌿 」┈┈┈╮*
*┆*
*┆ 📝 Nombre:* ${info.name || 'No disponible'}
*┆ 🆔 ID:* ${info.id || 'No disponible'}
*┆ 📍 Estado:* ${info.state || 'No disponible'}
*┆ 🗓️ Creado:* ${formattedDate}
*┆ 🔗 Enlace:* https://whatsapp.com/channel/${info.invite || 'No disponible'}
*┆ 👥 Seguidores:* ${info.subscribers || 0}
*┆ ✅ Verificado:* ${info.verified ? "Sí" : "No"}
*┆*
*┆ 📄 Descripción:* ${info.description || "Sin descripción disponible."}
*┆*
*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯*
            `.trim();
            await conn.reply(m.chat, responseText, m);
            m.react("✅"); // React with a checkmark emoji
        } catch (error) {
            // Log and send error message for channel info retrieval
            console.error("Error al obtener información del canal:", error);
            await conn.reply(m.chat, `*Error al procesar la solicitud del canal:* No se pudo obtener la información. Detalle: ${error.message}`, m);
        }
    } 
    // Handle Group Information
    else if (matchGroup) {
        // IMPORTANT CHANGE: Pass the full matched group link (matchGroup[0])
        // instead of just the invite code (matchGroup[2]).
        // Some WhatsApp libraries require the full link to fetch metadata.
        const fullGroupLink = matchGroup[0]; 
        try {
            // Use conn.groupMetadata with the full invite link to get group info
            const groupInfo = await conn.groupMetadata(fullGroupLink); 

            // Construct and send group information response
            let responseText = `
*╭┈┈┈「 💬 Información del Grupo 💬 」┈┈┈╮*
*┆*
*┆ 📝 Nombre:* ${groupInfo.subject || 'No disponible'}
*┆ 🆔 ID:* ${groupInfo.id || 'No disponible'}
*┆ 👥 Miembros:* ${groupInfo.size || 0}
*┆ 👑 Creador/Administrador:* ${groupInfo.owner ? `@${groupInfo.owner.split('@')[0]}` : 'No disponible'}
*┆*
*┆ 📄 Descripción:* ${groupInfo.desc || "Sin descripción disponible."}
*┆*
*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯*
            `.trim();
            // Send reply with mentions for the owner if available
            await conn.reply(m.chat, responseText, m, { mentions: groupInfo.owner ? [groupInfo.owner] : [] });
            m.react("✅"); // React with a checkmark emoji
        } catch (error) {
            // Log and send error message for group info retrieval
            console.error("Error al obtener información del grupo:", error);
            await conn.reply(m.chat, `*Error al procesar la solicitud del grupo:* No se pudo obtener la información. Asegúrate de que el enlace sea válido y el bot esté en el grupo o tenga acceso para ver su metadata. Detalle: ${error.message}`, m);
        }
    } 
    // Handle Community Information
    else if (matchCommunity) {
        const communityId = matchCommunity[1]; // Extract community ID
        try { 
            // Assume conn.communityMetadata is the correct function for community info
            // Note: This might require your 'conn' library to support community metadata retrieval.
            const communityInfo = await conn.communityMetadata(communityId); 

            // Construct and send community information response
            let responseText = `
*╭┈┈┈「 🏘️ Información de la Comunidad 🏘️ 」┈┈┈╮*
*┆*
*┆ 📝 Nombre:* ${communityInfo.name || 'No disponible'}
*┆ 🆔 ID:* ${communityInfo.id || 'No disponible'}
*┆ 👥 Miembros:* ${communityInfo.members?.length || 0}
*┆ 📄 Descripción:* ${communityInfo.description || "Sin descripción disponible."}
*┆*
*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯*
            `.trim();
            await conn.reply(m.chat, responseText, m);
            m.react("✅"); // React with a checkmark emoji
        } catch (error) {
            // Log and send error message for community info retrieval
            console.error("Error al obtener información de la comunidad:", error);
            await conn.reply(m.chat, `*Error al procesar la solicitud de la comunidad:* No se pudo obtener la información. Detalle: ${error.message}`, m);
        }
    } 
    // Handle Invalid Link
    else {
        // If no match, the link is invalid
        return conn.reply(m.chat, `*Enlace inválido:* Por favor, proporciona un enlace de WhatsApp válido para un canal, grupo o comunidad.`, m);
    }
};

// Define commands and help text
handler.command = ["inspeccionar", "channelinfo", "canalinfo", "groupinfo", "comunidadinfo"];
handler.help = ["infocanal <link>", "infogrupo <link>", "infocomunidad <link>"];
handler.tags = ["tools"];

export default handler;