import Fastify from 'fastify'
import { PORT, requiredConfigs } from './config'
import hrRoute from './hr-route'
import marketingRoute from './marketing-route'
import nusaprospectRoute from './nusaprospect-route'
import nusaworkRoute from './nusawork-route'
import { authenticateRequest } from './utils'

if (requiredConfigs.some((config) => !config)) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const fastify = Fastify({ logger: true })

fastify.addHook('preHandler', authenticateRequest)
fastify.register(nusaworkRoute, { prefix: '/nusawork' })
fastify.register(nusaprospectRoute, { prefix: '/nusaprospect' })
fastify.register(marketingRoute, { prefix: '/marketing' })
fastify.register(hrRoute, { prefix: '/hr' })

fastify.listen({ port: +PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error('Error starting server: ', err)
    process.exit(1)
  }
})
