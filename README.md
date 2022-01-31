# Fetch AWS V4

Wapper around `node-fetch` libray to sign the request with AWS V4 signature headers

## Setup
```js
import fetch from 'fetch-aws4';

void (async () => {
    // Getting credentials from environment var: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
    const response = await fetch('https://httpbin.org/html');
    console.log(await response.text());

    // Passing credentials as options
    const response = await fetch('https://httpbin.org/html', {
        credentials: {
            accessKeyId: 'key',
            secretAccessKey: 'secret',
            sessionToken: 'optional token',
        }
    });
    console.log(await response.text());
})();
```

## Working with JSON
```js
const jsonResponse = await fetch('https://httpbin.org/json');
console.log(await jsonResponse.json());
```

## POST request
```js
const postResponse = await fetch('https://httpbin.org/post', {
    method: 'POST',
});
console.log(await postResponse.json());
```

## Custom wrapper
```js
import nodeFetch from 'node-fetch';
import { wrapper } from 'fetch-aws4';

const nodeFetchResponse = await wrapper(nodeFetch)('https://httpbin.org/get');
console.log(await nodeFetchResponse.json());
```
