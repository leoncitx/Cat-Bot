
Let handler = async (event, { conn}) => {
  const chat = global.db.data.chats[event.id]
  // Asegura que la restricción solo se aplique si la configuración 'onlyLatinos' está activada en la base de datos del chat.
  if (!chat?.onlyLatinos) return

  const metadata = await conn.groupMetadata(event.id)
  const bot = metadata.participants.find(p => p.id === conn.user.jid)
  // Verifica si el bot es administrador del grupo. Es crucial para poder expulsar usuarios.
  const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin'

  // Si el bot no es admin, no puede realizar la acción de expulsión y la función termina.
  if (!isBotAdmin) return 

  // Lista de prefijos telefónicos prohibidos.
  const forbidPrefixes = [
    "212", // Marruecos
    "265", // Malaui
    "856", // Laos
    "234", // Nigeria
    "258", // Mozambique
    "263", // Zimbabue
    "93",  // Afganistán
    "967", // Yemen
    "92",  // Pakistán
    "254", // Kenia
    "213", // Argelia
    "960", // Maldivas
    "964", // Irak
    "973", // Baréin
    "971", // Emiratos Árabes Unidos
    "961", // Líbano
    "962"  // Jordania
  ]

  // Itera sobre los participantes afectados por el evento (entrada/salida).
  for (const participant of event.participants) {
    // Solo actúa si el evento es de "agregar" un participante.
    if (event.action === 'add') {
      const jid = participant
      const phone = jid.split('@')[0]
      // Extrae los primeros tres dígitos del número (el prefijo).
      const prefix = phone.substring(0, 3)

      // Comprueba si el prefijo del nuevo usuario está en la lista prohibida.
      if (forbidPrefixes.includes(prefix)) {
        // Notifica al grupo que el usuario será eliminado.
        await conn.sendMessage(event.id, {
          text: `🚫 *Acceso restringido*\nUsuario @${phone} no cumple con los requisitos del grupo.\nSerá eliminado automáticamente.`,
          mentions: [jid]
        })
        
        // Expulsa al usuario del grupo inmediatamente.
        await conn.groupParticipantsUpdate(event.id, [jid], 'remove')
      }
    }
  }
}

export default handler
// Indica que este handler debe ejecutarse cuando hay actualizaciones de participantes en el grupo.
handler.groupParticipantsUpdate = true
