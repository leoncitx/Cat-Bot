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
  
  let message = `⚽ *PARTIDO 4vs4* ⚽\n\n`
  
  message += `${formatPlayerList(players, 'JUGADORES', '❤️')} (${players.length}/8)\n\n`
  message += `${formatPlayerList(substitutes, 'SUPLENTES', '👍🏻')} (${substitutes.length}/2)\n\n`
  
  message += `📝 *Para anotarse:*\n`
  message += `❤️ → Jugar (${8 - players.length} cupos libres)\n`
  message += `👍🏻 → Suplente (${2 - substitutes.length} cupos libres)\n\n`
  
  if (players.length === 8) {
    const team1 = players.slice(0, 4)
    const team2 = players.slice(4, 8)
    
    message += `🔥 *¡EQUIPOS LISTOS!* 🔥\n\n`
    message += `🔴 *EQUIPO 1:*\n${team1.map((p, i) => `  ${i + 1}. ${getPlayerName(p)}`).join('\n')}\n\n`
    message += `🔵 *EQUIPO 2:*\n${team2.map((p, i) => `  ${i + 1}. ${getPlayerName(p)}`).join('\n')}`
  } else {
    message += `⏳ Faltan ${8 - players.length} jugadores para completar`
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
      
      await conn.sendMessage(chat, { react: { text: '❤️', key: sentMsg.key } })
      await conn.sendMessage(chat, { react: { text: '👍🏻', key: sentMsg.key } })
      
      newGame.messageKey = sentMsg.key
    } else {
      const gameInfo = gameData.get(chat)
      const message = createGameMessage(gameInfo)
      await m.reply(message)
    }
    
  } catch (error) {
    console.error('[Game4v4 Error]:', error)
    await m.reply('❌ Error al crear el partido')
  }
}

export const before = async (m, { conn, participants }) => {
  if (m.mtype !== 'reactionMessage') return
  
  const chat = m.chat
  const gameInfo = gameData.get(chat)
  
  if (!gameInfo) return
  
  const reaction = m.message.reactionMessage.text
  const user = m.sender
  const participant = participants?.find(p => p.id === user)
  
  if (!participant) return
  
  const reactionKey = `${user}-${reaction}`
  if (gameInfo.reactions.has(reactionKey)) return
  
  let updated = false
  
  if (reaction === '❤️') {
    if (gameInfo.players.length < 8 && 
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
    } catch {
      await conn.sendMessage(chat, { text: message })
    }
  }
}

handler.command = /^(4vs4|partido)$/i
handler.help = ['4vs4']
handler.tags = ['juegos']

export default handler