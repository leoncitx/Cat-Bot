
const handler = async (m, { conn, args}) => {
  if (!args[0]) {
    return m.reply(`📌 Ingresa el enlace de invitación de una comunidad o canal.\n\nEjemplo:\n.ins https://chat.whatsapp.com/xxxx`);
}

  const url = args[0];
  const code = url.split("/").pop().trim();

  if (!code || code.length < 6) return m.reply("❌ Enlace inválido.");

  try {
    await conn.groupAcceptInvite(code); // intenta unirse
    await new Promise(r => setTimeout(r, 2000)); // esperar para que aparezca en conn.chats

    const chats = conn.chats;
    const encontrados = Object.entries(chats).filter(([id, data]) => data?.inviteCode === code || id.includes(code));

    if (!encontrados.length) return m.reply("⚠️ No se encontró el grupo tras unirse. Puede que el bot no haya sido aceptado.");

    const [id, info] = encontrados[0];
    const tipo = id.includes("nestewall")? "📢 Canal (Newsletter)"
: id.startsWith("120363")? "👥 Comunidad"
: "👤 Grupo común";

    const nombre = info?.name || info?.subject || "Sin nombre";

    return m.reply(`🔎 *Resultado de inspección:*

📛 *Nombre:* ${nombre}
🆔 *ID:* ${id}
📌 *Tipo:* ${tipo}`);
} catch (e) {
    console.error(e);
    return m.reply("❌ Error al unirse o inspeccionar el enlace. ¿Está activo el link? ¿Tiene permisos el bot?");
}
};

handler.command = ["ins"];
handler.help = ["ins <link de invitación>"];
handler.tags = ["tools"];
export default handler;