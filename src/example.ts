import fetch from './fetch';
import nodeFetch from 'node-fetch';
import { wrapper } from './fetch';

void (async () => {
    const response = await fetch('https://httpbin.org/html');
    console.log(await response.text());

    const jsonResponse = await fetch('https://httpbin.org/json');
    console.log(await jsonResponse.json());

    const postResponse = await fetch('https://httpbin.org/post', {
        method: 'POST',
    });
    console.log(await postResponse.json());

    const nodeFetchResponse = await wrapper(nodeFetch)('https://httpbin.org/get');
    console.log(await nodeFetchResponse.json());
})();
