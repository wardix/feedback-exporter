import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  MARKETING_FEEDBACK_APP_NAME,
  MARKETING_FEEDBACK_DOC_ID,
  MARKETING_FEEDBACK_METRIC_NAME,
  MARKETING_FEEDBACK_NEW_STATUS,
  MARKETING_FEEDBACK_RANGE,
} from './config'
import { sheets } from './gws'
import { formatDate } from './utils'

export default async (fastify: FastifyInstance) => {
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const output: string[] = []
    const metricName = MARKETING_FEEDBACK_METRIC_NAME
    try {
      const rangeValues = await sheets.spreadsheets.values.get({
        spreadsheetId: MARKETING_FEEDBACK_DOC_ID,
        range: MARKETING_FEEDBACK_RANGE,
      })
      for (const [
        submitTime,
        user,
        description,
        _link,
        _photo,
        status,
      ] of rangeValues.data.values as string[][]) {
        if (status !== MARKETING_FEEDBACK_NEW_STATUS) {
          continue
        }
        const issue =
          description.length > 32
            ? `${description.substring(0, 32)}...`
            : description
        const submitDateTime = new Date(submitTime)
        const submitTimestamp = Math.floor(submitDateTime.getTime() / 1000)

        const labels = [
          `app="${MARKETING_FEEDBACK_APP_NAME}"`,
          `from="${user.trim()}"`,
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
