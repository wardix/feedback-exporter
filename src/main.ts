import { config } from 'dotenv'
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { JWT } from 'google-auth-library'
import { google } from 'googleapis'

config()

const PORT = process.env.PORT || 3000
const NUSAWORK_FEEDBACK_DOC_ID = process.env.NUSAWORK_FEEDBACK_DOC_ID || ''
const NUSAWORK_FEEDBACK_RANGE = process.env.NUSAWORK_FEEDBACK_RANGE || ''
const NUSAWORK_FEEDBACK_APP_NAME =
  process.env.NUSAWORK_FEEDBACK_APP_NAME || 'nusawork'
const NUSAWORK_FEEDBACK_NEW_STATUS =
  process.env.NUSAWORK_FEEDBACK_NEW_STATUS || 'new'
const NUSAWORK_FEEDBACK_METRIC_NAME =
  process.env.NUSAWORK_FEEDBACK_METRIC_NAME || 'feedback'

const NUSAPROSPECT_FEEDBACK_DOC_ID =
  process.env.NUSAPROSPECT_FEEDBACK_DOC_ID || ''
const NUSAPROSPECT_FEEDBACK_RANGE =
  process.env.NUSAPROSPECT_FEEDBACK_RANGE || ''
const NUSAPROSPECT_FEEDBACK_APP_NAME =
  process.env.NUSAWORK_FEEDBACK_APP_NAME || 'nusaprospect'
const NUSAPROSPECT_FEEDBACK_NEW_STATUS =
  process.env.NUSAPROSPECT_FEEDBACK_NEW_STATUS || 'new'
const NUSAPROSPECT_FEEDBACK_METRIC_NAME =
  process.env.NUSAPROSPECT_FEEDBACK_METRIC_NAME || 'feedback'

const MARKETING_FEEDBACK_DOC_ID = process.env.MARKETING_FEEDBACK_DOC_ID || ''
const MARKETING_FEEDBACK_RANGE = process.env.MARKETING_FEEDBACK_RANGE || ''
const MARKETING_FEEDBACK_APP_NAME =
  process.env.NUSAWORK_FEEDBACK_APP_NAME || 'marketing'
const MARKETING_FEEDBACK_NEW_STATUS =
  process.env.MARKETING_FEEDBACK_NEW_STATUS || 'new'
const MARKETING_FEEDBACK_METRIC_NAME =
  process.env.MARKETING_FEEDBACK_METRIC_NAME || 'feedback'

const HR_FEEDBACK_DOC_ID = process.env.HR_FEEDBACK_DOC_ID || ''
const HR_FEEDBACK_RANGE = process.env.HR_FEEDBACK_RANGE || ''
const HR_FEEDBACK_APP_NAME = process.env.HR_FEEDBACK_APP_NAME || 'hr'
const HR_FEEDBACK_NEW_STATUS = process.env.HR_FEEDBACK_NEW_STATUS || 'new'
const HR_FEEDBACK_METRIC_NAME =
  process.env.HR_FEEDBACK_METRIC_NAME || 'feedback'

const SERVICE_ACCOUNT_PRIVATE_KEY =
  process.env.SERVICE_ACCOUNT_PRIVATE_KEY || ''
const SERVICE_ACCOUNT_EMAIL = process.env.SERVICE_ACCOUNT_EMAIL || ''

const requiredConfigs: string[] = [
  NUSAWORK_FEEDBACK_DOC_ID,
  NUSAWORK_FEEDBACK_RANGE,
  NUSAPROSPECT_FEEDBACK_DOC_ID,
  NUSAPROSPECT_FEEDBACK_RANGE,
  MARKETING_FEEDBACK_DOC_ID,
  MARKETING_FEEDBACK_RANGE,
  HR_FEEDBACK_DOC_ID,
  HR_FEEDBACK_RANGE,
  SERVICE_ACCOUNT_PRIVATE_KEY,
  SERVICE_ACCOUNT_EMAIL,
]

const validApiKeys = JSON.parse(process.env.API_KEYS || '[]')
const serviceAccountPrivateKey = SERVICE_ACCOUNT_PRIVATE_KEY.replace(
  /\\n/g,
  '\n',
)

if (requiredConfigs.some((config) => !config)) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const jwt = new JWT({
  email: SERVICE_ACCOUNT_EMAIL,
  key: serviceAccountPrivateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

const formatDate = (date: Date) => {
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

const sheets = google.sheets({ version: 'v4', auth: jwt })

const fastify = Fastify({ logger: true })

const authenticateRequest = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const apiKey = request.headers['x-api-key']
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
}

const setupNusaworkRoute = async (fastify: FastifyInstance) => {
  fastify.get('/', async (_request, reply: FastifyReply) => {
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
        if (status !== NUSAWORK_FEEDBACK_NEW_STATUS) {
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

const setupNusaprospectRoute = async (fastify: FastifyInstance) => {
  fastify.get('/', async (_request, reply: FastifyReply) => {
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

const setupMarketingRoute = async (fastify: FastifyInstance) => {
  fastify.get('/', async (_request, reply: FastifyReply) => {
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

const setupHRRoute = async (fastify: FastifyInstance) => {
  fastify.get('/', async (_request, reply: FastifyReply) => {
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

fastify.addHook('preHandler', authenticateRequest)
fastify.register(setupNusaworkRoute, { prefix: '/nusawork' })
fastify.register(setupNusaprospectRoute, { prefix: '/nusaprospect' })
fastify.register(setupMarketingRoute, { prefix: '/marketing' })
fastify.register(setupHRRoute, { prefix: '/hr' })

fastify.listen({ port: +PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error('Error starting server: ', err)
    process.exit(1)
  }
})
