import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createReadStream } from 'node:fs'
import { prisma } from '../lib/prisma'
import { openai } from '../lib/openai'

export const createTranscriptionRoute = async (app: FastifyInstance) =>
  app.post('/video/:videoId/transcription', async (request) => {
    const paramsSchema = z.object({
      videoId: z.string().uuid(),
    })
    const bodySchema = z.object({
      prompt: z.string(),
    })

    const { videoId } = paramsSchema.parse(request.params)
    const { prompt } = bodySchema.parse(request.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    const audioReadStream = createReadStream(video.path)

    const response = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'json',
      temperature: 0,
      prompt,
    })

    const transcription = response.text

    await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        transcription,
      },
    })

    return transcription
  })
