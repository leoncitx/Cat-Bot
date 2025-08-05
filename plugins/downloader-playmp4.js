// Importaciones necesarias
import fetch from 'node-fetch';
import yts from 'yt-search';
import { savetube } from '../lib/yt-savetube.js';
import { ogmp3 } from '../lib/youtubedl.js'; 

const LimitAud = 725 * 1024 * 1024; // 725MB
const LimitVid = 425 * 1024 * 1024; // 425MB
const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;
const userCaptions = new Map();
const userRequests = {};

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) return m.reply(`*🤔¿Qué estás buscando? 🤔*\n*Ingresa el nombre de la canción*\n\n*Ejemplo:*\n${usedPrefix + command} emilia 420`);

  const tipoDescarga = command === 'play' || command === 'musica' ? 'audio' : command === 'play2' ? 'video' : command === 'play3' ? 'audio (documento)' : command === 'play4' ? 'video (documento)' : '';
  
  if (userRequests[m.sender]) return await conn.reply(m.chat, `⏳ Hey @${m.sender.split('@')[0]}, ya estás descargando algo. 🙄 Espera a que termine tu solicitud actual antes de hacer otra...`, userCaptions.get(m.sender) || m);
  
  userRequests[m.sender] = true;

  try {
    let videoIdToFind = text.match(youtubeRegexID) || null;
    const yt_play = await search(args.join(' ')); 
    let ytplay2 = await yts(videoIdToFind === null ? text : 'https://youtu.be/' + videoIdToFind[1]);
    
    if (videoIdToFind) {
      const videoId = videoIdToFind[1];
      ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId);
    }
    
    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2;

    // Nuevo diseño del mensaje
    const PlayText = await conn.sendMessage(m.chat, {
      text: `🎶 *Reproduciendo:* ${yt_play[0].title}\n\n🔊 *Tipo de descarga:* ${tipoDescarga}\n\n⏳ *Por favor, espera mientras se procesa tu solicitud...*`,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          renderLargerThumbnail: true,
          title: yt_play[0].title,
          body: wm,
          mediaType: 1,
          thumbnailUrl: yt_play[0].thumbnail,
          sourceUrl: "https://whatsapp.com/channel/0029VaAN15BJP21BYCJ3tH04"
        }
      }
    }, { quoted: m });

    userCaptions.set(m.sender, PlayText);

    const [input, qualityInput = command === 'play' || command === 'musica' || command === 'play3' ? '320' : '720'] = text.split(' ');
    const audioQualities = ['64', '96', '128', '192', '256', '320'];
    const videoQualities = ['240', '360', '480', '720', '1080'];
    const isAudioCommand = command === 'play' || command === 'musica' || command === 'play3';
    const selectedQuality = (isAudioCommand ? audioQualities : videoQualities).includes(qualityInput) ? qualityInput : (isAudioCommand ? '320' : '720');
    const isAudio = command.toLowerCase().includes('mp3') || command.toLowerCase().includes('audio');
    const format = isAudio ? 'mp3' : '720';

    const audioApis = [
      { url: () => savetube.download(yt_play[0].url, format), extract: (data) => ({ data: data.result.download, isDirect: false }) },
      { url: () => ogmp3.download(yt_play[0].url, selectedQuality, 'audio'), extract: (data) => ({ data: data.result.download, isDirect: false }) },
      // Otras APIs...
    ];

    const videoApis = [
      { url: () => savetube.download(yt_play[0].url, '720'), extract: (data) => ({ data: data.result.download, isDirect: false }) },
      { url: () => ogmp3.download(yt_play[0].url, selectedQuality, 'video'), extract: (data) => ({ data: data.result.download, isDirect: false }) },
      // Otras APIs...
    ];

    const download = async (apis) => {
      let mediaData = null;
      let isDirect = false;
      for (const api of apis) {
        try {
          const data = await api.url();
          const { data: extractedData, isDirect: direct } = api.extract(data);
          if (extractedData) {
            const size = await getFileSize(extractedData);
            if (size >= 1024) {
              mediaData = extractedData;
              isDirect = direct;
              break;
            }
          }
        } catch (e) {
          console.log(`Error con API: ${e}`);
          continue;
        }
      }
      return { mediaData, isDirect };
    };

    // Manejo de la descarga de audio
    if (command === 'play' || command === 'musica') {
      const { mediaData, isDirect } = await download(audioApis);
      if (mediaData) {
        const fileSize = await getFileSize(mediaData);
        if (fileSize > LimitAud) {
          await conn.sendMessage(m.chat, { document: isDirect ? mediaData : { url: mediaData }, mimetype: 'audio/mpeg', fileName: `${yt_play[0].title}.mp3` }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, { audio: isDirect ? mediaData : { url: mediaData }, mimetype: 'audio/mpeg' }, { quoted: m });
        }
      }
    }

    // Manejo de la descarga de video
    if (command === 'play2' || command === 'video') {
      const { mediaData, isDirect } = await download(videoApis);
      if (mediaData) {
        const fileSize = await getFileSize(mediaData);
        const messageOptions = { fileName: `${yt_play[0].title}.mp4`, caption: `🔰 Aquí está tu video \n🔥 Título: ${yt_play[0].title}`, mimetype: 'video/mp4' };
        if (fileSize > LimitVid) {
          await conn.sendMessage(m.chat, { document: isDirect ? mediaData : { url: mediaData }, ...messageOptions }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, { video: isDirect ? mediaData : { url: mediaData }, thumbnail: yt_play[0].thumbnail, ...messageOptions }, { quoted: m });
        }
      }
    }

    // Manejo de otros comandos...
    
  } catch (error) {
    console.error(error);
    m.react("❌️");
  } finally {
    delete userRequests[m.sender]; 
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = ['play', 'playdoc'];
export default handler;

// Funciones auxiliares (search, secondString, getFileSize, etc.) se mantienen igual
