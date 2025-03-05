export type FetchFunction = typeof fetch
export type V4FetchFunction = (url: string | URL | Request, init?: V4RequestInit) => Promise<Response>

interface AwsCredentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken?: string
}

export interface V4RequestInit extends RequestInit {
  region?: string
  service?: string
  awsCredentials?: AwsCredentials
}
