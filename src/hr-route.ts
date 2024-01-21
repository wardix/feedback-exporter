import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  HR_FEEDBACK_APP_NAME,
  HR_FEEDBACK_DOC_ID,
  HR_FEEDBACK_METRIC_NAME,
  HR_FEEDBACK_NEW_STATUS,
  HR_FEEDBACK_RANGE,
} from './config'
import { sheets } from './gws'
import { formatDate } from './utils'

export default async (fastify: FastifyInstance) => {
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const output: string[] = []
    const metricName = HR_FEEDBACK_METRIC_NAME
    try {
      const rangeValues = await sheets.spreadsheets.values.get({
        spreadsheetId: HR_FEEDBACK_DOC_ID,
        range: HR_FEEDBACK_RANGE,
      })
      for (const [submitTime, description, status] of rangeValues.data
        .values as string[][]) {
        if (status !== HR_FEEDBACK_NEW_STATUS) {
          continue
        }
        const suggestion =
          description.length > 32
            ? `${description.substring(0, 32)}...`
            : description
        const submitDateTime = new Date(submitTime)
        const submitTimestamp = Math.floor(submitDateTime.getTime() / 1000)

        const labels = [
          `app="${HR_FEEDBACK_APP_NAME}"`,
          `since="${formatDate(submitDateTime)}"`,
          `suggestion="${suggestion}"`,
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
