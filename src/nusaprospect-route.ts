import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  NUSAPROSPECT_FEEDBACK_APP_NAME,
  NUSAPROSPECT_FEEDBACK_DOC_ID,
  NUSAPROSPECT_FEEDBACK_METRIC_NAME,
  NUSAPROSPECT_FEEDBACK_NEW_STATUS,
  NUSAPROSPECT_FEEDBACK_RANGE,
} from './config'
import { sheets } from './gws'
import { formatDate } from './utils'

export default async (fastify: FastifyInstance) => {
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const output: string[] = []
    const metricName = NUSAPROSPECT_FEEDBACK_METRIC_NAME
    try {
      const rangeValues = await sheets.spreadsheets.values.get({
        spreadsheetId: NUSAPROSPECT_FEEDBACK_DOC_ID,
        range: NUSAPROSPECT_FEEDBACK_RANGE,
      })
      for (const [
        user,
        submitTime,
        _preview,
        _link,
        description,
        status,
      ] of rangeValues.data.values as string[][]) {
        if (status !== NUSAPROSPECT_FEEDBACK_NEW_STATUS) {
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
          `app="${NUSAPROSPECT_FEEDBACK_APP_NAME}"`,
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
