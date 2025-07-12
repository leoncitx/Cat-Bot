
let handler = async (m, { conn, text, isRowner}) => {
  if (!text) return m.reply(`Por favor, proporciona un nombre para el bot.\n> Ejemplo: #setname Nombre/Texto`);

  const names = text.split('/');
  if (names.length!== 2) return m.reply(`Por favor, proporciona ambos nombres separados por una barra (/) en el formato: nombre1/nombre2.`);

  const nuevoNombre = names[0].trim();
  const nuevoTexto = names[1].trim();

  // Actualiza el nombre visible del bot en WhatsApp
  try {
    await conn.updateProfileName(nuevoNombre); // Método propio de Baileys
    global.botname = nuevoNombre;

    const etiqueta = 'MyBot'; // Personalizable
    const emoji2 = '🤖';
    global.textbot = `${nuevoTexto} • Powered By ${etiqueta}`;

    m.reply(`✅ Nombre actualizado correctamente.\n• Nombre del bot: ${global.botname}\n• Texto del bot: ${emoji2} ${global.textbot}`);
} catch (e) {
    m.reply(`❌ Error al intentar cambiar el nombre del perfil de WhatsApp.\nVerifica que el bot tenga permisos y que esté conectado correctamente.\n\nDetalles: ${e.message}`);
}
};

handler.help = ['setname'];
handler.tags = ['tools'];
handler.command = ['setname'];

export default handler;
