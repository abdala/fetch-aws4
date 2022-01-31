import { FetchFunction, V4FetchFunction, V4RequestInit } from './types';
import fetch, { wrapper } from './fetch.js'

export default fetch;
export {
    wrapper,
    FetchFunction, 
    V4FetchFunction, 
    V4RequestInit
}