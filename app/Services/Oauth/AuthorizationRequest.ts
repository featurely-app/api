import qs from 'qs'

export class AuthorizationRequest {
	private options: any = { searchParams: {} }

	constructor(private url: string) {}

	/**
	 * Define a query string
	 */
	public qs(key: string, value: any): this {
		this.options.searchParams[key] = value
		return this
	}

	public makeUrl() {
		if (Object.keys(this.options.searchParams).length) {
			return `${this.url}?${qs.stringify(this.options.searchParams)}`
		}

		return this.url
	}
}
