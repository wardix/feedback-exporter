import { config } from 'dotenv'

config()

export const PORT = process.env.PORT || 3000
export const NUSAWORK_FEEDBACK_DOC_ID =
  process.env.NUSAWORK_FEEDBACK_DOC_ID || ''
export const NUSAWORK_FEEDBACK_RANGE = process.env.NUSAWORK_FEEDBACK_RANGE || ''
export const NUSAWORK_FEEDBACK_APP_NAME =
  process.env.NUSAWORK_FEEDBACK_APP_NAME || 'nusawork'
export const NUSAWORK_FEEDBACK_NEW_STATUS =
  process.env.NUSAWORK_FEEDBACK_NEW_STATUS || 'new'
export const NUSAWORK_FEEDBACK_METRIC_NAME =
  process.env.NUSAWORK_FEEDBACK_METRIC_NAME || 'feedback'

export const NUSAPROSPECT_FEEDBACK_DOC_ID =
  process.env.NUSAPROSPECT_FEEDBACK_DOC_ID || ''
export const NUSAPROSPECT_FEEDBACK_RANGE =
  process.env.NUSAPROSPECT_FEEDBACK_RANGE || ''
export const NUSAPROSPECT_FEEDBACK_APP_NAME =
  process.env.NUSAWORK_FEEDBACK_APP_NAME || 'nusaprospect'
export const NUSAPROSPECT_FEEDBACK_NEW_STATUS =
  process.env.NUSAPROSPECT_FEEDBACK_NEW_STATUS || 'new'
export const NUSAPROSPECT_FEEDBACK_METRIC_NAME =
  process.env.NUSAPROSPECT_FEEDBACK_METRIC_NAME || 'feedback'

export const MARKETING_FEEDBACK_DOC_ID =
  process.env.MARKETING_FEEDBACK_DOC_ID || ''
export const MARKETING_FEEDBACK_RANGE =
  process.env.MARKETING_FEEDBACK_RANGE || ''
export const MARKETING_FEEDBACK_APP_NAME =
  process.env.NUSAWORK_FEEDBACK_APP_NAME || 'marketing'
export const MARKETING_FEEDBACK_NEW_STATUS =
  process.env.MARKETING_FEEDBACK_NEW_STATUS || 'new'
export const MARKETING_FEEDBACK_METRIC_NAME =
  process.env.MARKETING_FEEDBACK_METRIC_NAME || 'feedback'

export const HR_FEEDBACK_DOC_ID = process.env.HR_FEEDBACK_DOC_ID || ''
export const HR_FEEDBACK_RANGE = process.env.HR_FEEDBACK_RANGE || ''
export const HR_FEEDBACK_APP_NAME = process.env.HR_FEEDBACK_APP_NAME || 'hr'
export const HR_FEEDBACK_NEW_STATUS =
  process.env.HR_FEEDBACK_NEW_STATUS || 'new'
export const HR_FEEDBACK_METRIC_NAME =
  process.env.HR_FEEDBACK_METRIC_NAME || 'feedback'

export const SERVICE_ACCOUNT_PRIVATE_KEY =
  process.env.SERVICE_ACCOUNT_PRIVATE_KEY || ''
export const SERVICE_ACCOUNT_EMAIL = process.env.SERVICE_ACCOUNT_EMAIL || ''

export const requiredConfigs: string[] = [
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

export const validApiKeys = JSON.parse(process.env.API_KEYS || '[]')
