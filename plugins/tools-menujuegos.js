import fs from 'fs';
import path from 'path';

const handler = async (m, { conn}) => {
  const pluginsDir = path.resolve('./plugins');
  const ignoredFiles = ['.DS_Store'];

  const jsFiles = fs.readdirSync(pluginsDir)
.filter(file => file.endsWith('.js') &&!ignoredFiles.includes(file))
.map(file => path.join(pluginsDir, file));

  await m.react('🔍');
  conn.sendPresenceUpdate('composing', m.chat);

  let response = `🧩 *Verificación de Plugins de Comando (${jsFiles.length} archivos):*\n\n`;
  let hasIssues = false;

  for (const file of jsFiles) {
    try {
      const plugin = await import(`file://${file}`);
      if (!plugin.default ||!plugin.default.command ||!Array.isArray(plugin.default.command)) {
        hasIssues = true;
        response += `❌ *Plugin inválido:* ${path.basename(file)}\nNo se encontró 'handler.command' válido.\n\n`;
}
} catch (error) {
      hasIssues = true;
      response += `🚫 *Error al importar:* ${path.basename(file)}\n${error.message}\n\n`;
}
}

  if (!hasIssues) {
    response += '✅ ¡Todos los plugins de comando están correctamente definidos!';
}

  await conn.reply(m.chat, response, m);
  await m.react('✅');
};

handler.command = ['revplugins'];
handler.help = ['revplugins'];
handler.tags = ['tools'];
handler.owner = true;

export default handler;