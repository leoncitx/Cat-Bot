const descargarVideoFacebook = async (urlFacebook) => {
    if (typeof urlFacebook!== "string") throw Error(`¿Dónde está la URL?`)

    const respuesta = await fetch("https://fdown.net/download.php", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({ URLz: urlFacebook})
})

    if (!respuesta.ok) {
        const texto = await respuesta.text()
        throw Error(`${respuesta.status} ${respuesta.statusText} ${(texto || `(respuesta vacía)`).substring(0, 100)}`)
}

    const html = await respuesta.text()
    const hd = html.match(/id="hdlink" href="(.+?)" download/)?.[1]?.replaceAll("&amp;", "&")
    const sd = html.match(/id="sdlink" href="(.+?)" download/)?.[1]?.replaceAll("&amp;", "&")

    if (!hd &&!sd) throw Error(`No se encontró ningún video disponible para descargar`)

    return { hd, sd}
}

let handler = async (m, { conn, text}) => {
    if (!text) return m.reply(`Ejemplo:.fbdl https://www.facebook.com/share/v/...`)

    m.reply('⏳ Procesando...')

    try {
        const { hd, sd} = await descargarVideoFacebook(text)
        const urlVideo = hd || sd
        await conn.sendFile(m.chat, urlVideo, '_zenwik.mp4', '', m)
} catch (error) {
        m.reply(`Error: ${error.message}`)
}
}

handler.help = ['fbdl <url>']
handler.tags = ['descargas']
handler.command = ['fbdl']

export default handler