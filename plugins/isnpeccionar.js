let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, `*Uso correcto:* ${usedPrefix}${command} <enlace de canal/grupo/comunidad>`, m);
    }

    const channelRegex = /https:\/\/whatsapp\.com\/channel\/([0-9A-Za-z]+)/i;
    const groupRegex = /(https:\/\/chat\.whatsapp\.com\/)([0-9A-Za-z]{22})/i; 
    const communityRegex = /https:\/\/whatsapp\.com\/community\/([0-9A-Za-z]+)/i; 

    let matchChannel = text.match(channelRegex);
    let matchGroup = text.match(groupRegex);
    let matchCommunity = text.match(communityRegex);

    if (matchChannel) {
        const channelId = matchChannel[1];
        try {
            const info = await conn.newsletterMetadata("invite", channelId); 

            const creationDate = new Date(info.creation_time * 1000);
            const formattedDate = creationDate.toLocaleDateString("es-ES", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

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
            m.react("✅");
        } catch (error) {
            console.error("Error al obtener información del canal:", error);
            await conn.reply(m.chat, `*Error al procesar la solicitud del canal:* No se pudo obtener la información. Detalle: ${error.message}`, m);
        }
    } else if (matchGroup) {
        const groupInviteCode = matchGroup[2]; 
        try {
            // Reemplaza esta línea con la llamada real a tu API para obtener información del grupo.
            // Ejemplo: const groupInfo = await conn.groupMetadata(groupInviteCode);
            let groupInfo = { // Esto es un EJEMPLO, reemplázalo con datos reales de tu API
                id: "ID del Grupo Desconocido",
                subject: "Nombre del Grupo",
                size: 0, 
                owner: "Propietario del Grupo",
                desc: "Descripción del Grupo",
            };

            let responseText = `
*╭┈┈┈「 💬 Información del Grupo 💬 」┈┈┈╮*
*┆*
*┆ 📝 Nombre:* ${groupInfo.subject || 'No disponible'}
*┆ 🆔 ID:* ${groupInfo.id || 'No disponible'}
*┆ 👥 Miembros:* ${groupInfo.size || 0}
*┆ 👑 Creador/Administrador:* ${groupInfo.owner || 'No disponible'}
*┆*
*┆ 📄 Descripción:* ${groupInfo.desc || "Sin descripción disponible."}
*┆*
*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯*
            `.trim();
            await conn.reply(m.chat, responseText, m);
            m.react("✅");
        } catch (error) {
            console.error("Error al obtener información del grupo:", error);
            await conn.reply(m.chat, `*Error al procesar la solicitud del grupo:* No se pudo obtener la información. Detalle: ${error.message}`, m);
        }
    } else if (matchCommunity) {
        const communityId = matchCommunity[1];
        try }
             const communityInfo = await conn.communityMetadata(communityId);
            let communityInfo = { // Esto es un EJEMPLO, reemplázalo con datos reales de tu API
                id: "ID de la Comunidad Desconocido",
                name: "Nombre de la Comunidad",
                members: 0, 
                description: "Descripción de la Comunidad",
            };

            let responseText = `
*╭┈┈┈「 🏘️ Información de la Comunidad 🏘️ 」┈┈┈╮*
*┆*
*┆ 📝 Nombre:* ${communityInfo.name || 'No disponible'}
*┆ 🆔 ID:* ${communityInfo.id || 'No disponible'}
*┆ 👥 Miembros:* ${communityInfo.members || 0}
*┆*
*┆ 📄 Descripción:* ${communityInfo.description || "Sin descripción disponible."}
*┆*
*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯*
            `.trim();
            await conn.reply(m.chat, responseText, m);
            m.react("✅");
        } catch (error) {
            console.error("Error al obtener información de la comunidad:", error);
            await conn.reply(m.chat, `*Error al procesar la solicitud de la comunidad:* No se pudo obtener la información. Detalle: ${error.message}`, m);
        }
    } else {
        return conn.reply(m.chat, `*Enlace inválido:* Por favor, proporciona un enlace de WhatsApp válido para un canal, grupo o comunidad.`, m);
    }
};

handler.command = ["inspeccionar", "channelinfo", "canalinfo", "groupinfo", "comunidadinfo"]; 
handler.help = ["infocanal <link>", "infogrupo <link>", "infocomunidad <link>"]; 
handler.tags = ["tools"];

export default handler;
