import { JWT } from 'google-auth-library'
import { google } from 'googleapis'
import { SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PRIVATE_KEY } from './config'

const serviceAccountPrivateKey = SERVICE_ACCOUNT_PRIVATE_KEY.replace(
  /\\n/g,
  '\n',
)

const jwt = new JWT({
  email: SERVICE_ACCOUNT_EMAIL,
  key: serviceAccountPrivateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

export const sheets = google.sheets({ version: 'v4', auth: jwt })
