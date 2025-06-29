import { promises as fs } from 'fs'
import { join } from 'path'
import axios from 'axios'

let yeon = async (m, { conn, text, usedPrefix, command }) => {
    const DB_PATH = join(global.__dirname(import.meta.url), '../a-c.json')

    const readDB = async () => {
        try {
            const data = await fs.readFile(DB_PATH, 'utf-8')
            return JSON.parse(data)
        } catch (e) {
            await fs.writeFile(DB_PATH, '[]')
            return []
        }
    }

    const writeDB = async (data) => {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
    }

    const enemies = {
        guard: { name: 'Guardia Templaria', hp: 50, xp: 20, reward: 'poción_pequeña' },
        captain: { name: 'Capitán Templario', hp: 100, xp: 50, reward: 'poción_mediana' },
        master: { name: 'Maestro Asesino', hp: 200, xp: 100, reward: 'artefacto_legendario' }
    }

    const calculateLevel = (xp) => {
        return Math.floor(0.1 * Math.sqrt(xp))
    }

    if (command === 'acrpg') {
      m.reply(`⚔️ *RPG de Assassin’s Creed* ⚔️

🔹 /acstart
🔹 /acstats
🔹 /actrain
🔹 /acattack
🔹 /acinventory`)
    }

    if (command === 'acstart') {
        try {
            const db = await readDB()
            const user = db.find(u => u.id === m.sender)

            if (user) {
                await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } })
                return conn.sendMessage(m.chat, {
                    text: `🗡️ *Senpai*, ¡ya estás registrado en la hermandad!
¡Usa *.ac-stats* para ver tu progreso!`
                })
            }

            const newUser = {
                id: m.sender,
                name: m.pushName,
                level: 1,
                xp: 0,
                hp: 100,
                maxHp: 100,
                strength: 10,
                agility: 10,
                intelligence: 10,
                inventory: []
            }

            db.push(newUser)
            await writeDB(db)

            let caption = `✨ *Hermandad de Asesinos* ✨\n`
            caption += `📘 *¡Felicidades ${m.pushName}*! Te has unido a la hermandad.\n`
            caption += `📌 *Estadísticas Iniciales:* \n`
            caption += `🪶 Agilidad: 10\n`
            caption += `🗡️ Fuerza: 10\n`
            caption += `🧠 Inteligencia: 10\n`
            caption += `❤️ HP: 100/100\n`
            caption += `\n*¡Usa .acstats para monitorear tu progreso!*`

            await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
            await conn.sendMessage(m.chat, { react: { text: "🗡️", key: m.key } })
        } catch (e) {
            console.error(e.message)
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            await conn.sendMessage(m.chat, {
                text: `⚠️ *¡Ups, falló el inicio de tu viaje, Senpai!*`
            })
        }
    }

    if (command === 'acstats') {
        try {
            const db = await readDB()
            const user = db.find(u => u.id === m.sender)

            if (!user) {
                await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
                return conn.sendMessage(m.chat, {
                    text: `⚠️ *Senpai*, ¡aún no estás registrado! ¡Usa *.acstart* primero!`
                })
            }

            const currentLevel = calculateLevel(user.xp)
            const xpToNext = Math.ceil(Math.pow(currentLevel + 1, 2) * 100)

            let caption = `📜 *Perfil de Asesino* 📜\n`
            caption += `📌 *Nombre:* ${user.name}\n`
            caption += `🧬 *Nivel:* ${currentLevel}\n`
            caption += `⚔️ *XP:* ${user.xp}/${xpToNext}\n`
            caption += `❤️ *HP:* ${user.hp}/${user.maxHp}\n`
            caption += `🪶 *Agilidad:* ${user.agility}\n`
            caption += `🗡️ *Fuerza:* ${user.strength}\n`
            caption += `🧠 *Inteligencia:* ${user.intelligence}\n`
            caption += `🎒 *Inventario:* ${user.inventory.length > 0 ? user.inventory.join(', ') : 'Vacío'}`

            await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
            await conn.sendMessage(m.chat, { react: { text: "📜", key: m.key } })
        } catch (e) {
            console.error(e.message)
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            await conn.sendMessage(m.chat, {
                text: `⚠️ *¡Ups, falló la carga del perfil, Senpai!*`
            })
        }
    }

    if (command === 'actrain') {
        if (!text || !text.includes('|')) {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            return conn.sendMessage(m.chat, {
                text: `🏋️ *Senpai*, ¡formato incorrecto!
Ejemplo: *.actrain fuerza|10*
Estadísticas que se pueden entrenar: fuerza, agilidad, inteligencia`
            })
        }

        try {
            const [stat, amountStr] = text.split('|').map(v => v.trim())
            const amount = parseInt(amountStr)

            if (!['strength', 'agility', 'intelligence'].includes(stat)) {
                throw new Error('Estadística no válida')
            }

            if (isNaN(amount) || amount <= 0) {
                throw new Error('La cantidad de entrenamiento debe ser un número positivo')
            }

            const db = await readDB()
            const user = db.find(u => u.id === m.sender)

            if (!user) {
                await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
                return conn.sendMessage(m.chat, {
                    text: `⚠️ *Senpai*, ¡aún no estás registrado! ¡Usa *.acstart* primero!`
                })
            }

            const cost = amount * 10
            if (user.xp < cost) {
                throw new Error(`¡XP insuficiente! Se requieren ${cost} XP para entrenar ${stat} en ${amount}`)
            }

            user[stat] += amount
            user.xp -= cost

            await writeDB(db)

            let caption = `🏋️ *¡Entrenamiento Exitoso!* 🏋️\n`
            caption += `📌 *Estadística entrenada:* ${stat}\n`
            caption += `🔺 *Aumento:* +${amount}\n`
            caption += `⏳ *XP Gastada:* -${cost}\n`
            caption += `🧬 *XP Restante:* ${user.xp}`

            await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
            await conn.sendMessage(m.chat, { react: { text: "✨", key: m.key } })
        } catch (e) {
            console.error(e.message)
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            await conn.sendMessage(m.chat, {
                text: `⚠️ *¡Ups, falló el entrenamiento de la estadística, Senpai!*
${e.message}`
            })
        }
    }

    if (command === 'acattack') {
        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            return conn.sendMessage(m.chat, {
                text: `⚔️ *Senpai*, ¡elige un enemigo!
Enemigos disponibles: guardia, capitán, maestro`
            })
        }

        try {
            const enemyKey = text.toLowerCase()
            const enemy = enemies[enemyKey]

            if (!enemy) {
                throw new Error(`¡Enemigo no encontrado! Elige entre: ${Object.keys(enemies).join(', ')}`)
            }

            const db = await readDB()
            const user = db.find(u => u.id === m.sender)

            if (!user) {
                await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
                return conn.sendMessage(m.chat, {
                    text: `⚠️ *Senpai*, ¡aún no estás registrado! ¡Usa *.acstart* primero!`
                })
            }

            if (user.hp <= 0) {
                throw new Error('¡Estás inconsciente! ¡Usa una poción primero!')
            }

            const playerDamage = Math.floor(user.strength * (Math.random() + 0.5))
            const enemyDamage = Math.floor(enemy.hp * 0.1)

            user.hp -= enemyDamage
            if (user.hp < 0) user.hp = 0

            const gainedXp = enemy.xp
            const gainedItem = enemy.reward
            const isVictory = playerDamage >= enemy.hp

            if (isVictory) {
                user.xp += gainedXp
                user.inventory.push(gainedItem)

                let caption = `⚔️ *¡Victoria!* 🎯\n`
                caption += `📌 *Derrotaste a ${enemy.name}*\n`
                caption += `🔺 *XP obtenida:* +${gainedXp}\n`
                caption += `🎁 *Recompensa:* ${gainedItem.replace('_', ' ').toUpperCase()}\n`
                caption += `💔 *HP perdido:* -${enemyDamage}\n`
                caption += `❤️ *HP restante:* ${user.hp}`

                await writeDB(db)
                await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
                await conn.sendMessage(m.chat, { react: { text: "✨", key: m.key } })
            } else {
                let caption = `🩸 *Derrota Temporal* 💥\n`
                caption += `📌 *¡${enemy.name} te ha contraatacado con ferocidad!* \n`
                caption += `💔 *HP perdido:* -${enemyDamage}\n`
                caption += `❤️ *HP restante:* ${user.hp}`

                await writeDB(db)
                await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
                await conn.sendMessage(m.chat, { react: { text: "🩸", key: m.key } })
            }
        } catch (e) {
            console.error(e.message)
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            await conn.sendMessage(m.chat, {
                text: `⚠️ *¡Ups, falló la batalla, Senpai!*
${e.message}`
            })
        }
    }

    if (command === 'acinventory') {
        try {
            const db = await readDB()
            const user = db.find(u => u.id === m.sender)

            if (!user) {
                await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
                return conn.sendMessage(m.chat, {
                    text: `⚠️ *Senpai*, ¡aún no estás registrado! ¡Usa *.acstart* primero!`
                })
            }

            const items = user.inventory
            if (!items.length) {
                await conn.sendMessage(m.chat, { react: { text: "🎒", key: m.key } })
                return conn.sendMessage(m.chat, {
                    text: `📦 *¡Tu inventario está vacío, Senpai!*`
                })
            }

            const itemCount = {}
            items.forEach(item => {
                itemCount[item] = (itemCount[item] || 0) + 1
            })

            let caption = `🎒 *Inventario de Asesino* 🎒\n`
            Object.entries(itemCount).forEach(([item, count]) => {
                caption += `• ${item.replace('_', ' ').toUpperCase()} x${count}\n`
            })

            await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
            await conn.sendMessage(m.chat, { react: { text: "🎒", key: m.key } })
        } catch (e) {
            console.error(e.message)
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            await conn.sendMessage(m.chat, {
                text: `⚠️ *¡Ups, falló la carga del inventario, Senpai!*`
            })
        }
    }
}

yeon.help = ['acrpg', 'acstart', 'acstats', 'actrain <estadística>|<cantidad>', 'acattack <enemigo>', 'acinventory']
yeon.tags = ['rpg']
yeon.command = /^(acrpg|acstart|acstats|actrain|acattack|acinventory)$/i
yeon.register = true
yeon.group = true
export default yeon
