import MockDate from 'mockdate';
import { wrapper } from './fetch';
import { V4FetchFunction } from './types';
import {jest} from '@jest/globals';
import {Mock} from 'jest-mock';

describe('AWS v4 fetch wrapper', () => {
    let stubFetch: Mock<any, any>;
    let fetch: V4FetchFunction;

    beforeAll(() => {
        MockDate.set('2020-01-01T00:00:00');
    });
    
    afterAll(() => {
        MockDate.reset();
    });

    beforeEach(() => {
        stubFetch = jest.fn();
        fetch = wrapper(stubFetch);

        process.env.AWS_ACCESS_KEY_ID = 'AWS_ACCESS_KEY_ID';
        process.env.AWS_SECRET_ACCESS_KEY = 'AWS_SECRET_ACCESS_KEY';
    });

    it('Return original fetch response', async() => {
        const stubResponse = 'value';

        stubFetch.mockReturnValueOnce(stubResponse);

        const response = await fetch('http://example.site');

        expect(response).toEqual(stubResponse);
    });

    it('Sign a request with environment credentials', async() => {
        await fetch('http://example.site');

        expect(stubFetch).toHaveBeenCalledWith('http://example.site', {
            headers: {
                Authorization: "AWS4-HMAC-SHA256 Credential=AWS_ACCESS_KEY_ID/20191231/us-east-1/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=ea8453bbe7f5f52a5e3d01c7acf5d6bda833ec4584ad6250f351f1ddc1f7d9c7",
                Host: "example.site",
                'X-Amz-Date': "20191231T230000Z"
            },
            host: "example.site",
            service: 'execute-api',
            path: "/",
        });
    });

    it('Sign a request with credentials', async() => {
        await fetch('http://example.site', {
            credentials: {
                accessKeyId: 'accessKeyId',
                secretAccessKey: 'secretAccessKey',
            },
        });

        expect(stubFetch).toHaveBeenCalledWith('http://example.site', {
            credentials: { accessKeyId: "accessKeyId", secretAccessKey: "secretAccessKey" },
            headers: {
                Authorization: "AWS4-HMAC-SHA256 Credential=accessKeyId/20191231/us-east-1/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=41e3d830e4192ae88ae70218cd8d45daa0e1ec79cb0fa10554753aaf12b485ad",
                Host: "example.site",
                'X-Amz-Date': "20191231T230000Z"
            },
            host: "example.site",
            service: 'execute-api',
            path: "/",
        });
    });

    it('Throw exception when credentials are not defined', async () => {
        delete process.env.AWS_ACCESS_KEY_ID;
        delete process.env.AWS_SECRET_ACCESS_KEY;
        
        const fetchPromise = fetch('http://example.site');
        
        await expect(fetchPromise).rejects.toEqual(new Error('Credentials not defined.'));
    });

    it('Sign a request with query string', async() => {
        await fetch('http://example.site?key=value');

        expect(stubFetch).toHaveBeenCalledWith('http://example.site?key=value', {
            headers: {
                Authorization: "AWS4-HMAC-SHA256 Credential=AWS_ACCESS_KEY_ID/20191231/us-east-1/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=2c9708ea532b175f52636fa513065219565610adb8595d6df762d63bcbddc651",
                Host: "example.site",
                'X-Amz-Date': "20191231T230000Z"
            },
            host: "example.site",
            path: "/?key=value",
            service: 'execute-api',
        });
    });

    it('Sign a request with region', async() => {
        await fetch('http://example.site', { 
            host: 'example.site', 
            region: 'eu-central-1',
            service: 'execute-api',
        });

        expect(stubFetch).toHaveBeenCalledWith('http://example.site', {
            headers: {
                Authorization: "AWS4-HMAC-SHA256 Credential=AWS_ACCESS_KEY_ID/20191231/eu-central-1/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=72463c524687e00a6c610012ee867220a8a57e656df5e8c7c2e68deb6a28567c",
                Host: "example.site",
                'X-Amz-Date': "20191231T230000Z"
            },
            host: "example.site",
            path: "/",
            region: "eu-central-1",
            service: "execute-api",
        });
    });

    it('Sign a request with path', async() => {
        await fetch('http://example.site/path', {
            region: 'eu-central-1',
            service: 'execute-api',
        });

        expect(stubFetch).toHaveBeenCalledWith('http://example.site/path', {
            headers: {
                Authorization: "AWS4-HMAC-SHA256 Credential=AWS_ACCESS_KEY_ID/20191231/eu-central-1/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=43a7c24059f2ed5fd75c2f828a2390a9e36dbce4ee749ac57debdf2e8674d7e5",
                Host: "example.site",
                'X-Amz-Date': "20191231T230000Z"
            },
            host: "example.site",
            path: "/path",
            region: "eu-central-1",
            service: "execute-api",
        });
    });

    it('Sign a post request', async() => {
        await fetch('http://example.site', {
            region: 'eu-central-1',
            service: 'execute-api',
            method: 'POST',
            body: JSON.stringify({
                key: 'value',
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        });

        expect(stubFetch).toHaveBeenCalledWith('http://example.site', {
            body: '{"key":"value"}',
            headers: {
                Authorization: "AWS4-HMAC-SHA256 Credential=AWS_ACCESS_KEY_ID/20191231/eu-central-1/execute-api/aws4_request, SignedHeaders=content-length;content-type;host;x-amz-date, Signature=a9c694eb4f9e0e6f6dbf96998193f4d064c33c5692a180cc8d56a3f1e716bff8",            
                Host: "example.site",
                'X-Amz-Date': "20191231T230000Z",
                'Content-Type': 'application/json',
                'Content-Length': '15',
            },
            host: "example.site",
            method: 'POST',
            path: "/",
            region: "eu-central-1",
            service: "execute-api",
        });
    });

    it('Sign a AWS call', async() => {
        await fetch('https://s3.us-west-2.amazonaws.com/mybucket/puppy.jpg', {
            method: 'POST',
            body: JSON.stringify({ key: 'value' }),
            headers: { 'Content-Type': 'application/json' },
        });

        expect(stubFetch).toHaveBeenCalledWith('https://s3.us-west-2.amazonaws.com/mybucket/puppy.jpg', {
            body: '{"key":"value"}',
            headers: {
                Authorization: "AWS4-HMAC-SHA256 Credential=AWS_ACCESS_KEY_ID/20191231/us-west-2/s3/aws4_request, SignedHeaders=content-length;content-type;host;x-amz-content-sha256;x-amz-date, Signature=dbaf5c99c703c4f57f6d504a33fefa4acf50e7cf42b2d688f3ed7bb174d662c8",
                Host: "s3.us-west-2.amazonaws.com",
                'X-Amz-Date': "20191231T230000Z",
                'Content-Type': 'application/json',
                'Content-Length': '15',
                'X-Amz-Content-Sha256': "e43abcf3375244839c012f9633f95862d232a95b00d5bc7348b3098b9fed7f32",
            },
            host: "s3.us-west-2.amazonaws.com",
            method: 'POST',
            path: "/mybucket/puppy.jpg",
        });
    });
});