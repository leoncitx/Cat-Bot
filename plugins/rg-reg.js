
import { createHash} from 'crypto';

let handler = async (m, { conn, text, usedPrefix, command}) => {
  const pattern = /^([^\s]+)\.(\d{1,2})\.(.+)$/i;
  const user = global.db.data.users[m.sender];
  const imageUrl = 'https://i.imgur.com/nkXnkeB.jpg'; // Nueva imagen

  if (user?.registered)
    return m.reply(`✅ Ya estás registrado.\n🗑️ Para eliminar tu registro usa: *${usedPrefix}unreg*`);

  if (!pattern.test(text))
    return m.reply(`❌ *Formato incorrecto.*\n📌 Usa: *${usedPrefix + command} nombre.edad.país*\n📍 Ejemplo: *${usedPrefix + command} Barboza.18.Venezuela*`);

  const [, name, ageRaw, country] = text.match(pattern);
  const age = parseInt(ageRaw);

  if (!name || name.length> 32) return m.reply('🚫 Nombre inválido o demasiado largo (máx 32 caracteres).');
  if (isNaN(age) || age < 5 || age> 99) return m.reply('🚫 Edad no válida (debe ser entre 5 y 99).');
  if (!country || country.length> 40) return m.reply('🚫 País inválido o demasiado largo.');

  const hashId = createHash('md5').update(m.sender).digest('hex');

  global.db.data.users[m.sender] = {
    name,
    age,
    country,
    registered: true,
    regTime: Date.now(),
    id: hashId
};

  const info = `🎉 *¡Registro Completado!*

🧾 *Datos del usuario:*
╭──────────────
├ 👤 *Nombre:* ${name}
├ 🎂 *Edad:* ${age} años
├ 🌎 *País:* ${country}
╰──────────────
🆔 *ID:* ${hashId}
`;

  await conn.sendMessage(m.chat, {
    image: { url: imageUrl},
    caption: info
});

  await conn.sendMessage(m.chat, {
    text: `✅ *Verificación realizada con éxito* 🎯`
});
};

handler.help = ['registro <nombre.edad.país>'];
handler.tags = ['registro'];
handler.command = ['registro', 'reg'];

export default handler;