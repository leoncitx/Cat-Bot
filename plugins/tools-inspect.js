
const handler = async (m, { conn, args, command}) => {
  if (!args[0]) return m.reply(`⚠️ Ingresa el link de la comunidad o canal.\n\nEjemplo:\n.inspec https://chat.whatsapp.com/ABC123...`);

  const url = args[0];

  // Validar formato del link
  const regex = /chat\.whatsapp\.com\/([a-zA-Z0-9]+)/;
  const match = url.match(regex);
  if (!match) return m.reply("❌ El enlace no parece ser válido.");

  const inviteCode = match[1];

  try {
    const info = await conn.groupGetInviteInfo(inviteCode);
    const chatID = info.id;
    const name = info.subject;
    const isChannel = chatID.startsWith("120363") && chatID.includes("g.us") && chatID.includes("nestewall"); // ajuste personalizado
    const isCommunity = chatID.startsWith("120363") && chatID.includes("g.us") &&!chatID.includes("nestewall");

    let tipo = "Grupo desconocido";
    if (isChannel) tipo = "Canal (nestewall)";
    else if (isCommunity) tipo = "Comunidad";

    m.reply(`📦 *Resultado de inspección:*

📛 *Nombre:* ${name}
🆔 *ID:* ${chatID}
📌 *Tipo:* ${tipo}`);
} catch (e) {
    console.error(e);
    m.reply("❌ No se pudo inspeccionar el enlace. ¿El bot está autorizado para verlo?");
}
};

handler.command = ["inspect"];
handler.help = ["inspect <enlace>"];
handler.tags = ["tools"];
export default handler;