const gameData = new Map()

const createNewGame = () => ({
  players: [],
  substitutes: [],
  reactions: new Set()
})

const getPlayerName = (participant) => {
  return participant.name || participant.notify || participant.verifiedName || 'Usuario'
}

const formatPlayerList = (players, title, emoji) => {
  if (players.length === 0) return `${emoji} ${title}: Ninguno`
  return `${emoji} ${title}:\n${players.map((p, i) => `  ${i + 1}. ${getPlayerName(p)}`).join('\n')}`
}

const createGameMessage = (gameInfo) => {
  const { players, substitutes } = gameInfo
  
  let message = `⚽ *PARTIDO 2vs2* ⚽\n\n`
  
  message += `${formatPlayerList(players, 'JUGADORES', '❤️')} (${players.length}/4)\n\n`
  message += `${formatPlayerList(substitutes, 'SUPLENTES', '👍🏻')} (${substitutes.length}/2)\n\n`
  
  message += `📝 *Para anotarse:*\n`
  message += `❤️ → Jugar (${4 - players.length} cupos libres)\n`
  message += `👍🏻 → Suplente (${2 - substitutes.length} cupos libres)\n\n`
  
  if (players.length === 4) {
    const team1 = players.slice(0, 2)
    const team2 = players.slice(2, 4)
    
    message += `🔥 *¡EQUIPOS LISTOS!* 🔥\n\n`
    message += `🔴 *EQUIPO 1:*\n${team1.map((p, i) => `  ${i + 1}. ${getPlayerName(p)}`).join('\n')}\n\n`
    message += `🔵 *EQUIPO 2:*\n${team2.map((p, i) => `  ${i + 1}. ${getPlayerName(p)}`).join('\n')}`
  } else {
    message += `⏳ Faltan ${4 - players.length} jugadores para completar`
  }
  
  return message
}

export const handler = async (m, { conn, command }) => {
  const chat = m.chat
  
  try {
    if (!gameData.has(chat)) {
      const newGame = createNewGame()
      gameData.set(chat, newGame)
      
      const message = createGameMessage(newGame)
      const sentMsg = await conn.sendMessage(chat, { text: message }, { quoted: m })
      
      newGame.messageKey = sentMsg.key
      newGame.messageId = sentMsg.key.id
    } else {
      const gameInfo = gameData.get(chat)
      const message = createGameMessage(gameInfo)
      await m.reply(message)
    }
    
  } catch (error) {
    console.error('[Game2v2 Error]:', error)
    await m.reply('❌ Error al crear el partido')
  }
}

export const before = async (m, { conn, participants }) => {
  if (!m.message?.reactionMessage) return
  
  const chat = m.chat
  const gameInfo = gameData.get(chat)
  
  if (!gameInfo) return

  const reactionMsg = m.message.reactionMessage
  if (reactionMsg.key.id !== gameInfo.messageId) return
  
  const reaction = reactionMsg.text
  const user = reactionMsg.key.remoteJid === chat ? reactionMsg.key.participant : reactionMsg.key.remoteJid
  const participant = participants?.find(p => p.id === user)
  
  if (!participant) return
  
  const reactionKey = `${user}-${reaction}`
  if (gameInfo.reactions.has(reactionKey)) return
  
  let updated = false
  
  if (reaction === '❤️') {
    if (gameInfo.players.length < 4 && 
        !gameInfo.players.some(p => p.id === user) && 
        !gameInfo.substitutes.some(p => p.id === user)) {
      
      gameInfo.players.push(participant)
      gameInfo.reactions.add(reactionKey)
      updated = true
    }
  } else if (reaction === '👍🏻') {
    if (gameInfo.substitutes.length < 2 && 
        !gameInfo.players.some(p => p.id === user) && 
        !gameInfo.substitutes.some(p => p.id === user)) {
      
      gameInfo.substitutes.push(participant)
      gameInfo.reactions.add(reactionKey)
      updated = true
    }
  }
  
  if (updated) {
    const message = createGameMessage(gameInfo)
    
    try {
      await conn.sendMessage(chat, { 
        text: message,
        edit: gameInfo.messageKey
      })
    } catch (e) {
      const newMsg = await conn.sendMessage(chat, { text: message })
      gameInfo.messageKey = newMsg.key
      gameInfo.messageId = newMsg.key.id
    }
  }
}

handler.command = /^(4vs4|partido)$/i
handler.help = ['4vs4']
handler.tags = ['juegos']
handler.group = true

export default handler