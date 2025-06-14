import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) throw m.reply(`✧ Ejemplo: ${usedPrefix}${command} Waguri Edit`);

 await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key }})

    let results = await yts(text);
    let tes = results.videos[0]

  const args = text.split(' ');
  const videoUrl = args[0];
  
  const apiUrl = `https://www.apis-anomaki.zone.id/downloader/ytv?url=${encodeURIComponent(tes.url)}`;

  try {
    const respuesta = await fetch(apiUrl);
    const keni = await respuesta.json()
    const { url, qualityLabel, fps } = keni.result.formats[0];
    const { title } = keni.result;

    if (!url) throw m.reply('No hay respuesta de la api.');


    const caption = `
      *💮 PLAY VIDEO 💮*
 
  ✧ : \`titulo;\` ${tes.title || 'no encontrado'}
  ✧ : \`duracion;\` ${tes.duration || 'no encontrado'}
  ✧ : \`calidad;\` ${qualityLabel || 'no encontrado'}
  ✧ : \`fps;\` ${fps || 'no encontrado'}
 
> ${wm}
> Pedido de @${m.sender.split('@')[0]}`;

//await conn.sendMessage(m.chat, { document: { url: url }, caption: caption, mimetype: 'video/mp4', fileName: `${title}` + `.mp4`}, {quoted: m })

    await conn.sendMessage(m.chat, {
      video: { url: url },
      mimetype: "video/mp4",
      fileName: title,
      caption,
      mentions: [m.sender]
    }, { quoted: m });
await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }})

  } catch (error) {
    console.error(`Error: ${error.message}`);
    await conn.sendMessage(m.chat, { react: { text: '❎', key: m.key }})
  }
};

handler.help = ['playvideo *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(playvideo|playvid)$/i;

handler.register = true
handler.disable = false

export default handler


/*{
  "status": true,
  "creator": "Xyzan - Anomaki",
  "result": {
    "status": "success",
    "formats": [
      {
        "itag": 18,
        "mimeType": "video/mp4; codecs=\"avc1.42001E, mp4a.40.2\"",
        "bitrate": 679679,
        "width": 640,
        "height": 360,
        "lastModified": "1748374401371375",
        "contentLength": "12514605",
        "quality": "medium",
        "fps": 30,
        "qualityLabel": "360p",
        "projectionType": "RECTANGULAR",
        "averageBitrate": 679435,
        "audioQuality": "AUDIO_QUALITY_LOW",
        "approxDurationMs": "147353",
        "audioSampleRate": "44100",
        "audioChannels": 2,
        "qualityOrdinal": "QUALITY_ORDINAL_360P",
        "url": "https://redirector.googlevideo.com/videoplayback?expire=1749917496&ei=2EpNaIvOJNugzPsP8JmRwQc&ip=176.1.132.81&id=o-AGO9qj_josGpkFezjbicwMQ3NQG1QRSx_YEFCajdKhkJ&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1749895896%2C&mh=zy&mm=31%2C29&mn=sn-uxax4vopj5qx-q0n6%2Csn-4g5ednd7&ms=au%2Crdu&mv=m&mvi=1&pcm2cms=yes&pl=17&rms=au%2Cau&initcwndbps=1780000&bui=AY1jyLPsq8WSgxzpa4Hek_qJ6nth1dYtgbzZC1UTvxKh9-7jlb7g6XIj3SY2FvIS_lvsI6rzP7dsxRU_&spc=l3OVKdljChCDPNF31leOKVjNZVXMG4stB2qrEZnC4flyLd6Y-kVt1ac&vprv=1&svpuc=1&mime=video%2Fmp4&ns=0RVDH9jDlHmV6yU98Sj70w0Q&rqh=1&gir=yes&clen=12514605&ratebypass=yes&dur=147.353&lmt=1748374401371375&mt=1749895496&fvip=3&fexp=51331020%2C51466697&c=MWEB&sefc=1&txp=4538534&n=CeDJHrJ4RoRYMg&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpcm2cms%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRAIgf5fcs6XzrmcFvlbn0ga69ebXLi-sKEyxEkW-9irntxkCIDwJkISDFk-ZuJNoeYrquYzBTuBKx1R8UCGW9sv7kTXl&sig=AJfQdSswRAIgZWxJAyMKKZyDUvEz-zscdj5eatsYfis3gN6jL6Da2CECIC2c1SuXujvpfBJ4cxownfVudtrNe8ggOV_Ev9R3uPUg&pot=MnRSeo2OUa_KU1JG9ZB4_xttIYscGQMCPg6SXX3Msekhg3rXGM4Cvs2Gw4g9NKBBZca6YPTwbudHtmv0I6mJK53vtCBBNcWccHH5SbFwZT1t-AIXg2x0EWRNV7nkmUG8gxjNxUzAWNpyKtwGrTNMqXiztKpSGQ=="
      }
    ],
    "title": "Lamine Yamal - Y QUE FUE? (Don Miguelo)"
  }
}*/