import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`🎩 Ingrese una URL de TikTok\n*Ejemplo:* ${usedPrefix + command} https://vm.tiktok.com/ZMh3KL31o/`);
  }

  try {
    m.react('🕑'); 

    let api = `https://eliasar-yt-api.vercel.app/api/search/tiktok?query=${args[0]}`;
    let response = await fetch(api);
    let json = await response.json();
    let res = json.results;

    let aud = res.audio;
    let title = res.title || 'Audio de TikTok'; 

    if (!aud) {
      return m.reply('❌ No se encontró el audio para esta URL de TikTok.');
    }

    await conn.sendMessage(m.chat, {
      audio: { url: aud },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`, 
      ptt: false 
    }, { quoted: m });

    m.react('✅'); 

  } catch (e) {
    console.error('Error fetching TikTok audio:', e); 
    m.reply(`❌ Ocurrió un error al obtener el audio de TikTok. Intente de nuevo más tarde.`);
    m.react('✖️'); 
  }
}

handler.command = ['tiktokmp3', 'ttmp3'];

export default handler;
