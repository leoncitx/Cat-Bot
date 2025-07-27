let handler = async (m, { conn, text, isRowner }) => {
  // Define your emojis and etiqueta here
  const emoji = '✅'; // Example: A checkmark emoji
  const emoji2 = '📝'; // Example: A memo emoji
  const etiqueta = 'Your Etiqueta Here'; // Example: A custom label or tag

  if (!text) return m.reply(`${emoji} Por favor, proporciona un nombre para el bot.\n> Ejemplo: #setname Nombre/Texto`);

  const names = text.split('/');
  if (names.length !== 2) return m.reply(`${emoji} Por favor, proporciona ambos nombres separados por una barra (/) en el formato: nombre1/nombre2.`);

  global.botname = names[0].trim();
  const texto1bot = ` • Powered By ${etiqueta}`;
  global.textbot = `${names[1].trim()}${texto1bot}`;

  m.reply(`${emoji} El nombre del bot ha sido cambiado a: ${global.botname}\n\n> ${emoji2} El texto del bot ha sido cambiado a: ${global.textbot}`);
};

handler.help = ['setname'];
handler.tags = ['tools'];
handler.command = ['setname'];
handler.rowner = false;

export default handler;
