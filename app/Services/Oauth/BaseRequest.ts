import got from 'got'

export class BaseRequest {
	private options: any = {
		searchParams: {},
		body: {},
		headers: {},
		sendJSON: false,
		acceptJSON: false,
	}

	constructor(private url: string) {}

	/**
	 * Define a query string
	 */
	public qs(key: string, value: any): this {
		this.options.searchParams[key] = value
		return this
	}

	/**
	 * Define a query string
	 */
	public field(key: string, value: any): this {
		this.options.body[key] = value
		return this
	}

	public header(key: string, value: any): this {
		this.options.headers[key] = value
		return this
	}

	public acceptJSON() {
		this.options.acceptJSON = true
		return this
	}

	public sendJSON() {
		this.options.sendJSON = true
		return this
	}

	public get(): Promise<any> {
		return got.get(this.url, {
			searchParams: this.options.searchParams,
			headers: this.options.headers,
			responseType: this.options.acceptJSON ? 'json' : 'text',
		})
	}

	public post(): Promise<any> {
		return got.post(this.url, {
			searchParams: this.options.searchParams,
			headers: this.options.headers,
			...(this.options.sendJSON ? { json: this.options.body } : {}),
			responseType: this.options.acceptJSON ? 'json' : 'text',
		})
	}
}
