import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export const getAllPromptsRoute = async (app: FastifyInstance) =>
  app.get('/prompts', async () => await prisma.prompt.findMany())
