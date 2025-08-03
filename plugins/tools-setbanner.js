import { obfuscate} from 'javascript-obfuscator'

let handler = async (m, { conn, text}) => {
  if (!text) return m.reply('⚠️ Ingresa el código JavaScript que deseas ofuscar usando el comando.')

  try {
    let codigoOfuscado = obfuscate(text, {
      compact: false,
      controlFlowFlattening: true,
      deadCodeInjection: true,
      simplify: true,
      numbersToExpressions: true
}).getObfuscatedCode()

    await conn.sendMessage(m.chat, { text: codigoOfuscado}, { quoted: m})
} catch (error) {
    m.reply(`❌ Error al ofuscar el código: ${error.message}`)
}
}

handler.command = /^(ofuscar|ofuscador|obfuscar)$/i
handler.help = ['ofuscar <código>']
handler.tags = ['herramientas']

export default handler