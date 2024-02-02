import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  NUSAWORK_FEEDBACK_APP_NAME,
  NUSAWORK_FEEDBACK_DOC_ID,
  NUSAWORK_FEEDBACK_METRIC_NAME,
  NUSAWORK_FEEDBACK_NEW_STATUS,
  NUSAWORK_FEEDBACK_RANGE,
} from './config'
import { sheets } from './gws'
import { formatDate } from './utils'

export default async (fastify: FastifyInstance) => {
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const output: string[] = []
    const metricName = NUSAWORK_FEEDBACK_METRIC_NAME
    try {
      const rangeValues = await sheets.spreadsheets.values.get({
        spreadsheetId: NUSAWORK_FEEDBACK_DOC_ID,
        range: NUSAWORK_FEEDBACK_RANGE,
      })
      for (const [
        user,
        submitTime,
        _preview,
        _link,
        description,
        status,
      ] of rangeValues.data.values as string[][]) {
        if (status !== NUSAWORK_FEEDBACK_NEW_STATUS && status !== undefined) {
          continue
        }
        const [_company, shortUser] = user.includes('/')
          ? user.split('/')
          : ['', user]
        const [_type, ...descriptions] = description.split('\n')
        const realDescription = descriptions.join(' ')
        const issue =
          realDescription.length > 32
            ? `${realDescription.substring(0, 32)}...`
            : realDescription
        const submitDateTime = new Date(submitTime)
        const submitTimestamp = Math.floor(submitDateTime.getTime() / 1000)

        const labels = [
          `app="${NUSAWORK_FEEDBACK_APP_NAME}"`,
          `from="${shortUser.trim()}"`,
          `since="${formatDate(submitDateTime)}"`,
          `issue="${issue}"`,
        ]
        output.push(`${metricName}{${labels.join(',')}} ${submitTimestamp}`)
      }
      reply.send(output.join('\n'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Internal Server Error' })
    }
  })
}
