import axios from 'axios'
import * as cheerio from 'cheerio'

function shuffle(arr) {
    for (let i = arr.length - 1; i> 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
;[arr[i], arr[j]] = [arr[j], arr[i]]
}
    return arr
}

async function mfsearch(query) {
    if (!query) throw new Error('Query is required')
    const { data: html} = await axios.get(`https://mediafiretrend.com/?q=${encodeURIComponent(query)}&search=Search`)
    const $ = cheerio.load(html)
    const links = shuffle(
        $('tbody tr a[href*="/f/"]').map((_, el) => $(el).attr('href')).get()
).slice(0, 5)

    const result = await Promise.all(links.map(async link => {
        const { data} = await axios.get(`https://mediafiretrend.com${link}`)
        const $ = cheerio.load(data)
        const raw = $('div.info tbody tr:nth-child(4) td:nth-child(2) script').text()
        const match = raw.match(/unescape\(['"`]([^'"`]+)['"`]\)/)
        if (!match) throw new Error('No se pudo decodificar el enlace')
        const decoded = cheerio.load(decodeURIComponent(match[1]))
        return {
            filename: $('tr:nth-child(2) td:nth-child(2) b').text().trim(),
            filesize: $('tr:nth-child(3) td:nth-child(2)').text().trim(),
            url: decoded('a').attr('href'),
            source_url: $('tr:nth-child(5) td:nth-child(2)').text().trim(),
            source_title: $('tr:nth-child(6) td:nth-child(2)').text().trim()
}
}))
    return result
}

let handler = async (m, { text}) => {
    if (!text) return m.reply('Contoh:.mfsearch epep config')

    m.reply('🔍 Buscando archivos...')
    try {
        let res = await mfsearch(text)
        if (!res.length) return m.reply('❌ No se encontró nada, prueba con otra búsqueda')
        let tekss = res.map((v, i) =>
            `${i + 1}. ${v.filename}\n📦 Tamaño: ${v.filesize}\n🔗 Link: ${v.url}\n📌 Fuente: ${v.source_title} (${v.source_url})`
).join('\n\n')
        await m.reply(tekss)
} catch (e) {
        m.reply(`⚠️ Error: ${e.message}`)
}
}

handler.help = ['mediafiresearch <query>']
handler.tags = ['search']
handler.command = ['mfsearch', 'mediafiresearch']

export default handler