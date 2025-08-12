import axios from 'axios';

// 📸 Función para obtener datos del perfil de Instagram usando Mollygram
const obtenerPerfilMollygram = async (usuario: string) => {
  const { data} = await axios.get(`https://media.mollygram.com/?url=${encodeURIComponent(usuario)}`, {
    headers: {
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
      'origin': 'https://mollygram.com',
      'referer': 'https://mollygram.com/',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/107.0.0.0 Safari/537.36'
}
});

  const html = data.html;

  const extraerDato = (regex: RegExp): string | null =>
    html.match(regex)?.[1]?.trim() || null;

  const fotoPerfil = extraerDato(/<img[^>]*class="[^"]*rounded-circle[^"]*"[^>]*src="([^"]+)"/i)
    || extraerDato(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*rounded-circle[^"]*"/i);

  return {
    usuario: extraerDato(/<h4 class="mb-0">([^<]+)<\/h4>/),
    nombreCompleto: extraerDato(/<p class="text-muted">([^<]+)<\/p>/),
    biografia: extraerDato(/<p class="text-dark"[^>]*>([^<]+)<\/p>/),
    fotoPerfil,
    publicaciones: extraerDato(/<div[^>]*>\s*<span class="d-block h5 mb-0">([^<]+)<\/span>\s*<div[^>]*>posts<\/div>/i),
    seguidores: extraerDato(/<div[^>]*>\s*<span class="d-block h5 mb-0">([^<]+)<\/span>\s*<div[^>]*>followers<\/div>/i),
    siguiendo: extraerDato(/<div[^>]*>\s*<span class="d-block h5 mb-0">([^<]+)<\/span>\s*<div[^>]*>following<\/div>/i)
};
};

// 🧩 Comando del bot
let handler = async (m, { conn, args}) => {
  if (!args[0]) throw '📌 Ejemplo de uso:.igstalk mycyll.7';

  const perfil = await obtenerPerfilMollygram(args[0]);

  const mensaje = `👤 *Perfil de Instagram*\n`
    + `• 🆔 Usuario: ${perfil.usuario}\n`
    + `• 📛 Nombre completo: ${perfil.nombreCompleto}\n`
    + `• 📝 Biografía: ${perfil.biografia}\n`
    + `• 📸 Publicaciones: ${perfil.publicaciones}\n`
    + `• 👥 Seguidores: ${perfil.seguidores}\n`
    + `• 🧑‍🤝‍🧑 Siguiendo: ${perfil.siguiendo}`;

  if (perfil.fotoPerfil) {
    await conn.sendMessage(m.chat, {
      image: { url: perfil.fotoPerfil},
      caption: mensaje
}, { quoted: m});
} else {
    await m.reply(mensaje);
}
};

handler.help = ['igstalk'];
handler.command = ['igstalk'];
handler.tags = ['herramientas'];

export default handler;