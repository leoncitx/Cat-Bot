import fetch from 'node-fetch'
import axios from 'axios'

const jugadores = new Map()
const escuadras = [[], [], [], []]
const suplentes = []
const maxPorEscuadra = 4
const maxSuplentes = 2

// Function to render the current state of squads and substitutes
const render = () => {
  let salida = `*16 𝐕𝐄𝐑𝐒𝐔𝐒 16*\n\n⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎                  •\n🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎:\n🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀:\n\n➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃:\n➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒:\n`

  for (let i = 0; i < 4; i++) {
    salida += `\n         𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 ${i + 1}\n\n👑 ┇ ${escuadras[i][0] || '—'}\n`
    for (let j = 1; j < maxPorEscuadra; j++) {
      salida += `🥷🏻 ┇ ${escuadras[i][j] || '—'}\n`
    }
  }

  salida += `\nㅤʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:\n`
  for (let i = 0; i < maxSuplentes; i++) {
    salida += `🥷🏻 ┇ ${suplentes[i] || '—'}\n`
  }

  return salida
}

// Handler for the command
let handler = async (m, { conn }) => {
  // Send the initial message with the player list
  const msg = await conn.sendMessage(m.chat, { text: render() })

  // Store the message key to update it later
  const messageKey = msg.key

  // Add a reaction listener for this specific message
  conn.ev.on('message.reaction', async (reaction) => {
    // Check if the reaction is for our message
    if (reaction.key.id === messageKey.id && reaction.key.remoteJid === messageKey.remoteJid) {
      const reactorJid = reaction.key.participant || reaction.key.remoteJid
      let reactorName;

      // Try to get the name from group participants if available
      try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        reactorName = groupMetadata.participants.find(p => p.id === reactorJid)?.pushName || groupMetadata.participants.find(p => p.id === reactorJid)?.name || reactorJid.split('@')[0]
      } catch (e) {
        // Fallback for non-group chats or if metadata fetching fails
        reactorName = reactorJid.split('@')[0]
      }

      // Check if the user is already in any list
      const userAlreadyInSquad = escuadras.flat().includes(reactorName)
      const userAlreadyInSuplentes = suplentes.includes(reactorName)
      
      // If a user removes their reaction, remove them from the lists
      if (reaction.reaction === '') { // Reaction removed
        if (jugadores.has(reactorJid)) {
            const currentName = jugadores.get(reactorJid)
            // Remove from squads
            for (let i = 0; i < escuadras.length; i++) {
                const index = escuadras[i].indexOf(currentName)
                if (index !== -1) {
                    escuadras[i].splice(index, 1)
                    break
                }
            }
            // Remove from suplentes
            const suplentesIndex = suplentes.indexOf(currentName)
            if (suplentesIndex !== -1) {
                suplentes.splice(suplentesIndex, 1)
            }
            jugadores.delete(reactorJid)
            await conn.relayMessage(m.chat, {
                extendedTextMessage: {
                    text: render(),
                    contextInfo: {
                        stanzaId: messageKey.id,
                        participant: messageKey.participant,
                        quotedMessage: messageKey.quotedMessage
                    }
                }
            }, { messageId: messageKey.id })
            return // Exit after handling removal
        }
      }

      // If the user is reacting to join
      if (reaction.reaction === '👍') {
        if (!userAlreadyInSquad && !userAlreadyInSuplentes) {
          let addedToSquad = false
          for (let i = 0; i < escuadras.length; i++) {
            if (escuadras[i].length < maxPorEscuadra) {
              jugadores.set(reactorJid, reactorName) // Store the user and their name
              escuadras[i].push(reactorName)
              addedToSquad = true
              break
            }
          }
          if (addedToSquad) {
            // Update the message if a change occurred
            await conn.relayMessage(m.chat, {
              extendedTextMessage: {
                text: render(),
                contextInfo: {
                  stanzaId: messageKey.id,
                  participant: messageKey.participant,
                  quotedMessage: messageKey.quotedMessage
                }
              }
            }, { messageId: messageKey.id })
          }
        }
      } else if (reaction.reaction === '❤️') {
        if (suplentes.length < maxSuplentes && !userAlreadyInSquad && !userAlreadyInSuplentes) {
          jugadores.set(reactorJid, reactorName) // Store the user and their name
          suplentes.push(reactorName)
          // Update the message if a change occurred
          await conn.relayMessage(m.chat, {
            extendedTextMessage: {
              text: render(),
              contextInfo: {
                stanzaId: messageKey.id,
                participant: messageKey.participant,
                quotedMessage: messageKey.quotedMessage
              }
            }
          }, { messageId: messageKey.id })
        }
      }
    }
  })
}

handler.help = ['16vs16']
handler.tags = ['freefire']
handler.command = /^(vs16|16vs16)$/i
handler.group = true
export default handler
