import chalk from 'chalk'
import fetch from 'node-fetch'
import ws from 'ws'
let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs'
import path from 'path'

let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return

    const fkontak = { 
        "key": { 
            "participants":"0@s.whatsapp.net", 
            "remoteJid": "status@broadcast", 
            "fromMe": false, 
            "id": "Halo" 
        }, 
        "message": { 
            "contactMessage": { 
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
            }
        }, 
        "participant": "0@s.whatsapp.net"
    }  

    let chat = global.db.data.chats[m.chat]
    let usuario = `@${m.sender.split`@`[0]}`
    let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/xr2m6u.jpg'

    let nombre, foto, edit, newlink, status, admingp, noadmingp

    nombre = `✨ ${usuario} *ha cambiado el nombre del grupo* ✨\n\n> 📝 *Nuevo nombre:* _${m.messageStubParameters[0]}_`
    foto = `📸 *¡Nueva foto de grupo!* 📸\n\n> 💫 Acción realizada por: ${usuario}`
    edit = `⚙️ ${usuario} ha ajustado la configuración del grupo.\n\n> 🔒 Ahora *${m.messageStubParameters[0] == 'on' ? 'solo los administradores' : 'todos'}* pueden configurar el grupo.`
    newlink = `🔗 *¡El enlace del grupo ha sido restablecido!* 🔗\n\n> 💫 Acción realizada por: ${usuario}`
    status = `🗣️ El grupo ha sido *${m.messageStubParameters[0] == 'on' ? 'cerrado' : 'abierto'}* por ${usuario}!\n\n> 💬 Ahora *${m.messageStubParameters[0] == 'on' ? 'solo los administradores' : 'todos'}* pueden enviar mensajes.`
    admingp = `👑 @${m.messageStubParameters[0].split`@`[0]} *¡Ahora es administrador del grupo!* 👑\n\n> 💫 Acción realizada por: ${usuario}`
    noadmingp = `🗑️ @${m.messageStubParameters[0].split`@`[0]} *ha dejado de ser administrador del grupo.* 🗑️\n\n> 💫 Acción realizada por: ${usuario}`

    if (chat.detect && m.messageStubType == 2) {
        const uniqid = (m.isGroup ? m.chat : m.sender)
        const sessionPath = './Sessions/'
        for (const file of await fs.readdir(sessionPath)) {
            if (file.includes(uniqid)) {
                await fs.unlink(path.join(sessionPath, file))
                console.log(`${chalk.yellow.bold('[ Archivo Eliminado ]')} ${chalk.greenBright(`'${file}'`)}\n` +
                            `${chalk.blue('(Session PreKey)')} ${chalk.redBright('que provoca el "undefined" en el chat')}`
                )
            }
        }
    } else if (chat.detect && m.messageStubType == 21) {
        await this.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak })  
    } else if (chat.detect && m.messageStubType == 22) {
        await this.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak })
    } else if (chat.detect && m.messageStubType == 23) {
        await this.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak })
    } else if (chat.detect && m.messageStubType == 25) {
        await this.sendMessage(m.chat, { text: edit, mentions: [m.sender] }, { quoted: fkontak })  
    } else if (chat.detect && m.messageStubType == 26) {
        await this.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak })  
    } else if (chat.detect && m.messageStubType == 29) {
        await this.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: fkontak })
    } else if (chat.detect && m.messageStubType == 30) {
        await this.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: fkontak })
    } else {
        if (m.messageStubType == 2) return
        console.log({
            messageStubType: m.messageStubType,
            messageStubParameters: m.messageStubParameters,
            type: WAMessageStubType[m.messageStubType], 
        })
    }
}
export default handler
