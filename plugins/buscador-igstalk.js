import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command}) => {
  if (!args[0]) {
    return m.reply(`📸 Ingresa un nombre de usuario de Instagram\n*Ejemplo:* ${usedPrefix + command} mycyll.7`);
}

  const username = args[0].replace(/^@/, '');

  try {
    m.react('🔍');

    const apiUrl = `https://media.mollygram.com/?url=${encodeURIComponent(username)}`;
    const headers = {
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'origin': 'https://mollygram.com',
      'referer': 'https://mollygram.com/',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
};

    const res = await fetch(apiUrl, { headers});
    const json = await res.json();

    if (json.status!== 'ok') {
      return m.reply('❌ No se pudo obtener la información del perfil. Verifica el nombre de usuario.');
}

    const html = json.html;

    const getMatch = (regex: RegExp): string | null => {
      const match = html.match(regex);
      return match? match[1].trim(): null;
};

    const profilePic = getMatch(/<img[^>]*class="[^"]*rounded-circle[^"]*"[^>]*src="([^"]+)"/i)
      || getMatch(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*rounded-circle[^"]*"/i);

    const uname = getMatch(/<h4 class="mb-0">([^<]+)<\/h4>/);
    const fullname = getMatch(/<p class="text-muted">([^<]+)<\/p>/);
    const bio = getMatch(/<p class="text-dark"[^>]*>([^<]+)<\/p>/);
    const posts = getMatch(/<div[^>]*>\s*<span class="d-block h5 mb-0">([^<]+)<\/span>\s*<div[^>]*>posts<\/div>/i);
    const followers = getMatch(/<div[^>]*>\s*<span class="d-block h5 mb-0">([^<]+)<\/span>\s*<div[^>]*>followers<\/div>/i);
    const following = getMatch(/<div[^>]*>\s*<span class="d-block h5 mb-0">([^<]+)<\/span>\s*<div[^>]*>following<\/div>/i);

    let caption = `👤 *Perfil de Instagram*\n`;
    caption += `• 🆔 Usuario: @${uname || username}\n`;
    caption += `• 📛 Nombre: ${fullname || 'No disponible'}\n`;
    caption += `• 📝 Bio: ${bio || 'Sin descripción'}\n`;
    caption += `• 📸 Publicaciones: ${posts || '0'}\n`;
    caption += `• 👥 Seguidores: ${followers || '0'}\n`;
    caption += `• 🧑‍🤝‍🧑 Siguiendo: ${following || '0'}`;

    if (profilePic) {
      await conn.sendFile(m.chat, profilePic, 'profile.jpg', caption, m);
} else {
      m.reply(caption);
}

    m.react('✅');

} catch (e) {
    console.error('Error al obtener perfil de Instagram:', e);
    m.reply(`❌ Ocurrió un error al obtener el perfil: ${e.message}`);
    m.react('✖️');
}
};

handler.command = ['igstalk', 'instastalk'];
export default handler;