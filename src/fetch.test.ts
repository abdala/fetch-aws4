import nock from 'nock'
import MockDate from 'mockdate'
import fetch from './fetch'
import {it, describe, beforeEach} from 'node:test'
import assert from 'node:assert/strict'

MockDate.set('2020-01-01T00:00:00')

nock.disableNetConnect()

describe('AWS v4 fetch wrapper', () => {
  beforeEach(() => {
    process.env.AWS_ACCESS_KEY_ID = 'AWS_ACCESS_KEY_ID'
    process.env.AWS_SECRET_ACCESS_KEY = 'AWS_SECRET_ACCESS_KEY'
  })

  it('Return original fetch response', async () => {
    nock('http://example.site').get('/').reply(200)

    await fetch('http://example.site')
  })

  it('Sign a request with environment credentials', async () => {
    nock('http://example.site')
      .matchHeader(
        'Authorization',
        'AWS4-HMAC-SHA256 Credential=AWS_ACCESS_KEY_ID/20191231/us-east-1/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=ea8453bbe7f5f52a5e3d01c7acf5d6bda833ec4584ad6250f351f1ddc1f7d9c7',
      )
      .matchHeader('Host', 'example.site')
      .matchHeader('X-Amz-Date', '20191231T230000Z')
      .get('/')
      .reply(200)

    await fetch('http://example.site')
  })

  it('Sign a request with credentials', async () => {
    nock('http://example.site')
      .matchHeader(
        'Authorization',
        'AWS4-HMAC-SHA256 Credential=accessKeyId/20191231/us-east-1/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=41e3d830e4192ae88ae70218cd8d45daa0e1ec79cb0fa10554753aaf12b485ad',
      )
      .matchHeader('Host', 'example.site')
      .matchHeader('X-Amz-Date', '20191231T230000Z')
      .get('/')
      .reply(200)

    await fetch('http://example.site', {
      awsCredentials: {
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
      },
    })
  })

  it('Throw exception when credentials are not defined', async () => {
    delete process.env.AWS_ACCESS_KEY_ID
    delete process.env.AWS_SECRET_ACCESS_KEY

    await assert.rejects(fetch('http://example.site'), new Error('Credentials not defined.'))
  })

  it('Sign a request with query string', async () => {
    nock('http://example.site')
      .matchHeader(
        'Authorization',
        'AWS4-HMAC-SHA256 Credential=AWS_ACCESS_KEY_ID/20191231/us-east-1/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=2c9708ea532b175f52636fa513065219565610adb8595d6df762d63bcbddc651',
      )
      .matchHeader('Host', 'example.site')
      .matchHeader('X-Amz-Date', '20191231T230000Z')
      .get('/')
      .query({key: 'value'})
      .reply(200)

    await fetch('http://example.site?key=value')
  })

  it('Sign a request with region', async () => {
    nock('http://example.site')
      .matchHeader(
        'Authorization',
        'AWS4-HMAC-SHA256 Credential=AWS_ACCESS_KEY_ID/20191231/eu-central-1/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=72463c524687e00a6c610012ee867220a8a57e656df5e8c7c2e68deb6a28567c',
      )
      .matchHeader('Host', 'example.site')
      .matchHeader('X-Amz-Date', '20191231T230000Z')
      .get('/')
      .reply(200)

    await fetch('http://example.site', {
      region: 'eu-central-1',
      service: 'execute-api',
    })
  })

  it('Sign a request with path', async () => {
    nock('http://example.site')
      .matchHeader(
        'Authorization',
        'AWS4-HMAC-SHA256 Credential=AWS_ACCESS_KEY_ID/20191231/eu-central-1/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=43a7c24059f2ed5fd75c2f828a2390a9e36dbce4ee749ac57debdf2e8674d7e5',
      )
      .matchHeader('Host', 'example.site')
      .matchHeader('X-Amz-Date', '20191231T230000Z')
      .get('/path')
      .reply(200)
      
    await fetch('http://example.site/path', {
      region: 'eu-central-1',
      service: 'execute-api',
    })
  })

  it('Sign a post request', async () => {
    nock('http://example.site')
      .matchHeader(
        'Authorization',
        'AWS4-HMAC-SHA256 Credential=AWS_ACCESS_KEY_ID/20191231/eu-central-1/execute-api/aws4_request, SignedHeaders=content-length;content-type;host;x-amz-date, Signature=a9c694eb4f9e0e6f6dbf96998193f4d064c33c5692a180cc8d56a3f1e716bff8',
      )
      .matchHeader('Host', 'example.site')
      .matchHeader('X-Amz-Date', '20191231T230000Z')
      .matchHeader('Content-Type', 'application/json')
      .post('/', '{"key":"value"}')
      .reply(200)

    await fetch('http://example.site', {
      region: 'eu-central-1',
      service: 'execute-api',
      method: 'POST',
      body: JSON.stringify({
        key: 'value',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  it('Sign a AWS call', async () => {
    nock('https://s3.us-west-2.amazonaws.com')
      .matchHeader(
        'Authorization',
        'AWS4-HMAC-SHA256 Credential=AWS_ACCESS_KEY_ID/20191231/us-west-2/s3/aws4_request, SignedHeaders=content-length;content-type;host;x-amz-content-sha256;x-amz-date, Signature=dbaf5c99c703c4f57f6d504a33fefa4acf50e7cf42b2d688f3ed7bb174d662c8',
      )
      .matchHeader('Host', 's3.us-west-2.amazonaws.com')
      .matchHeader('X-Amz-Date', '20191231T230000Z')
      .matchHeader('Content-Type', 'application/json')
      .post('/mybucket/puppy.jpg', '{"key":"value"}')
      .reply(200)

    await fetch('https://s3.us-west-2.amazonaws.com/mybucket/puppy.jpg', {
      method: 'POST',
      body: JSON.stringify({key: 'value'}),
      headers: {'Content-Type': 'application/json'},
    })
  })
})
