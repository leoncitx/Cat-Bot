import axios from 'axios'
import FormData from 'form-data'

const aiTextDetector = {
    analyze: async (aiText) => {
        if (aiText.length === 20000) {
            throw new Error("Teks lu terlalu panjang bree 😂, minimal 20000")
        }

        const news = new FormData()
        news.append("content", aiText)

        const headers = {
            headers: {
                ...news.getHeaders(),
                "Product-Serial": "808e957638180b858ca40d9c3b9d5bd3"
            }
        }

        const headersObject = {
            headers: {
                "Product-Serial": "808e957638180b858ca40d9c3b9d5bd3"
            }
        }

        const { data: getJob } = await axios.post(
            "https://api.decopy.ai/api/decopy/ai-detector/create-job",
            news,
            headers
        )

        const jobId = getJob.result.job_id

        const { data: processResult } = await axios.get(
            `https://api.decopy.ai/api/decopy/ai-detector/get-job/${jobId}`,
            headersObject
        )

        const output = processResult.result.output

        const formatted = output.sentences.map((sentence, index) => {
            return {
                no: index + 1,
                kalimat: sentence.content.trim(),
                score: Number(sentence.score.toFixed(3)),
                status: sentence.status === 1 ? "AI_GENERATED" : "HUMAN_GENERATED"
            }
        })

        return formatted
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Contoh : .aidetector Hai Saya Chat GPT`
    m.reply('wett')
    try {
        const result = await aiTextDetector.analyze(text)
        let output = result.map(r => 
            `no : ${r.no}\nkalimat : ${r.kalimat}\nscore : ${r.score}\nstatus : ${r.status}`
        ).join('\n\n')
        m.reply(output)
    } catch (e) {
        m.reply(`Eror kak : ${err.message}`)
    }
}

handler.help = ['aidetector <teks>']
handler.tags = ['ai']
handler.command = ['aidetector']

export default handler