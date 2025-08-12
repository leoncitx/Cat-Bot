import fetch from 'node-fetch';

async function obtenerPerfilInstagram(usuario: string) {
  const url = `https://media.mollygram.com/?url=${encodeURIComponent(usuario)}`;
  const headers = {
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
    'origin': 'https://mollygram.com',
    'referer': 'https://mollygram.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36'
};

  const respuesta = await fetch(url, { headers});
  const datos = await respuesta.json();

  if (datos.status!== 'ok') throw new Error('No se pudo obtener el perfil.');

  const html = datos.html;

  const extraer = (regex: RegExp): string | null => {
    const coincidencia = html.match(regex);
    return coincidencia? coincidencia[1].trim(): null;
};

  return {
    usuario: extraer(/<h4 class="mb-0">([^<]+)<\/h4>/),
    nombre: extraer(/<p class="text-muted">([^<]+)<\/p>/),
    biografia: extraer(/<p class="text-dark"[^>]*>([^<]+)<\/p>/),
    fotoPerfil: extraer(/<img[^>]*class="[^"]*rounded-circle[^"]*"[^>]*src="([^"]+)"/i)
      || extraer(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*rounded-circle[^"]*"/i),
    publicaciones: extraer(/<div[^>]*>\s*<span class="d-block h5 mb-0">([^<]+)<\/span>\s*<div[^>]*>posts<\/div>/i),
    seguidores: extraer(/<div[^>]*>\s*<span class="d-block h5 mb-0">([^<]+)<\/span>\s*<div[^>]*>followers<\/div>/i),
    siguiendo: extraer(/<div[^>]*>\s*<span class="d-block h5 mb-0">([^<]+)<\/span>\s*<div[^>]*>following<\/div>/i)
};
}

let handler = async (m, { conn, args}) => {
  if (!args[0]) {
    return m.reply('📸 Por favor, ingresa un nombre de usuario de Instagram.\n*Ejemplo:*.igstalk mycyll.7');
}

  try {
    m.react('🔎');

    const perfil = await obtenerPerfilInstagram(args[0]);

    const mensaje = `👤 *Perfil de Instagram*\n`
      + `• 🆔 Usuario: @${perfil.usuario || args[0]}\n`
      + `• 📛 Nombre: ${perfil.nombre || 'No disponible'}\n`
      + `• 📝 Biografía: ${perfil.biografia || 'Sin descripción'}\n`
      + `• 📸 Publicaciones: ${perfil.publicaciones || '0'}\n`
      + `• 👥 Seguidores: ${perfil.seguidores || '0'}\n`
      + `• 🧑‍🤝‍🧑 Siguiendo: ${perfil.siguiendo || '0'}`;

    if (perfil.fotoPerfil) {
      await conn.sendMessage(m.chat, {
        image: { url: perfil.fotoPerfil},
        caption: mensaje
}, { quoted: m});
} else {
      await m.reply(mensaje);
}

    m.react('✅');

} catch (error) {
    console.error('Error al obtener perfil:', error);
    m.reply(`❌ No se pudo obtener el perfil: ${error.message}`);
    m.react('⚠️');
}
};

handler.help = ['igstalk'];
handler.command = ['igstalk'];
handler.tags = ['herramientas'];

export default handler;