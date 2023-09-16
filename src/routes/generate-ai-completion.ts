import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { openai } from '../lib/openai'

export const generateAICompletionRoute = async (app: FastifyInstance) =>
  app.post('/ai/completion', async (request, reply) => {
    const bodySchema = z.object({
      videoId: z.string().uuid(),
      template: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
    })

    const { videoId, template, temperature } = bodySchema.parse(request.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    if (!video.transcription) {
      return reply
        .status(400)
        .send({ error: 'A transcrição do vídeo ainda não foi gerada!' })
    }

    const promptMessage = template.replace(
      '{transcription}',
      video.transcription
    )

    return await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      messages: [
        {
          role: 'user',
          content: promptMessage,
        },
      ],
      temperature,
    })
  })
