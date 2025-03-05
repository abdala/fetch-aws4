import {FetchFunction, V4FetchFunction, V4RequestInit} from './types'
import aws4, {Request} from 'aws4'

const normalizeHeaders = (signedOptions?: Request) => {
  const normalizedHeaders: Record<string, string> = {}
  for (const key in signedOptions?.headers) {
    normalizedHeaders[key] = String(signedOptions?.headers[key])
  }
  return normalizedHeaders
}

export const wrapper = (fetch: FetchFunction): V4FetchFunction => {
  return async (url: string | URL | globalThis.Request, init?: V4RequestInit): Promise<Response> => {
    if (!init?.awsCredentials && !process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('Credentials not defined.')
    }

    const parsedUrl = new URL(url.toString())
    const match = /([^.]+)\.(?:([^.]*)\.)?amazonaws\.com(\.cn)?$/.exec(parsedUrl.host)

    let options = {
      ...init as Request,
      host: parsedUrl.host,
      path: parsedUrl.pathname + parsedUrl.search,
    }

    if (!init?.service && !match) {
      options = {...options, service: 'execute-api'}
    }

    const signedOptions = aws4.sign(options, init?.awsCredentials)

    return fetch(url, {
      ...signedOptions,
      headers: normalizeHeaders(signedOptions),
    })
  }
}

export default wrapper(fetch)
