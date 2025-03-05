import awsFetch from './fetch'
import {wrapper} from './fetch'

const response = await awsFetch('https://httpbin.org/html')
console.log(await response.text())

const jsonResponse = await awsFetch('https://httpbin.org/json')
console.log(await jsonResponse.json())

const postResponse = await awsFetch('https://httpbin.org/post', {
method: 'POST',
})
console.log(await postResponse.json())

const nodeFetchResponse = await wrapper(fetch)('https://httpbin.org/get')
console.log(await nodeFetchResponse.json())
