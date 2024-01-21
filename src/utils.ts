import { FastifyReply, FastifyRequest } from 'fastify'
import { validApiKeys } from './config'

export const formatDate = (date: Date) => {
  const year = date.getFullYear()
  let month = `${date.getMonth() + 1}` // Months are zero indexed
  let day = `${date.getDate()}`
  let hour = `${date.getHours()}`
  let minute = `${date.getMinutes()}`

  // Pad the month, day, hour and minute with leading zeros if necessary
  month = +month < 10 ? `0${month}` : month
  day = +day < 10 ? `0${day}` : day
  hour = +hour < 10 ? `0${hour}` : hour
  minute = +minute < 10 ? `0${minute}` : minute

  return `${year}-${month}-${day} ${hour}:${minute}`
}

export const authenticateRequest = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const apiKey = request.headers['x-api-key']
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
}
