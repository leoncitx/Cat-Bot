import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn}) => {
  try {
    const q = m.quoted? m.quoted: m
    const mime = (q.msg || q).mimetype || ''

    if (!mime) return m.reply('Responde a un archivo multimedia (imagen/video/audio/documento)')

    m.reply('*Subiendo a MediaFire...*')

    let media = await q.download()
    let form = new FormData()
    form.append('file', media, `fgsi_${Date.now()}.${mime.split('/')[1]}`)

    let { data} = await axios.post('https://fgsi.koyeb.app/api/upload/uploadMediaFire', form, {
      headers: {
...form.getHeaders(),
        'Content-Type': 'multipart/form-data',
        'apikey': 'fgsiapi-213d7253-6d'
}
})

    let result = data.data

    m.reply(`${result.links.normal_download}`)

} catch (e) {
    m.reply(`⚠️ Error: ${e.message}`)
}
}

handler.help = ['upmf']
handler.command = ['upmf']
handler.tags = ['herramientas']

export default handler