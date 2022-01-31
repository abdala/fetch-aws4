import { RequestInfo, RequestInit, Response } from 'node-fetch';

export type FetchFunction = (url: RequestInfo, init?: RequestInit) => Promise<Response>;
export type V4FetchFunction = (url: RequestInfo, init?: V4RequestInit) => Promise<Response>;

interface Credentials {
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
}

export interface V4RequestInit extends RequestInit {
	region?: string;
	service?: string;
	host?: string;
	body?: string;
	credentials?: Credentials;
}
