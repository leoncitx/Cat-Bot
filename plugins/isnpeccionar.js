let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
        return conn.reply(m.chat, `*Uso correcto:* ${usedPrefix}${command} https://whatsapp.com/channel/0029Vb8kvXUBfxnzYWsbS81I`, m);
    }

    
    const channelRegex = /https:\/\/whatsapp\.com\/channel\/([0-9A-Za-z]+)/i;
    const match = text.match(channelRegex);

    if (!match) {
        return conn.reply(m.chat, `*Enlace inválido:* Por favor, proporciona un enlace de canal de WhatsApp válido.`, m);
    }

    const channelId = match[1];

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
*┆ 📄 Descripción:* *┆* ${info.description || "Sin descripción disponible."}
*┆*
*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯*
        `.trim();

       
        await conn.reply(m.chat, responseText, m);
        m.react("✅");

    } catch (error) {
        console.error("Error al obtener información del canal:", error);
        await conn.reply(m.chat, `*Error al procesar la solicitud:* No se pudo obtener la información del canal. Asegúrate de que el enlace sea correcto y el canal exista. Detalle: ${error.message}`, m);
    }
};

handler.command = ["inspeccionar", "channelinfo", "canalinfo"];
handler.help = ["infocanal <link>"];
handler.tags = ["tools"];

export default handler;
