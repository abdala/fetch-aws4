import { FetchFunction, V4FetchFunction, V4RequestInit } from './types';
import { sign } from 'aws4';
import { RequestInfo, Response } from 'node-fetch';
import originalFetch from 'node-fetch';

export const wrapper = (fetch: FetchFunction): V4FetchFunction => {
  return async (url: RequestInfo, init?: V4RequestInit): Promise<Response> => {
    if (! init?.credentials && ! process.env.AWS_ACCESS_KEY_ID && ! process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('Credentials not defined.');
    }

    const parsedUrl = new URL(url.toString());
    const match = /([^.]+)\.(?:([^.]*)\.)?amazonaws\.com(\.cn)?$/.exec(parsedUrl.host);

    let options = {
      ...init,
      host: parsedUrl.host,
      path: parsedUrl.pathname + parsedUrl.search,
    };

    if (! init?.service && ! match) {
      options = { ...options, service: 'execute-api' };
    }

    const signedOptions = sign(options, init?.credentials) as V4RequestInit;
    
    return fetch(url, signedOptions);
  };
};

export default  wrapper(originalFetch);