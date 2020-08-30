import { UserRequest } from './UserRequest'
import { AccessTokenRequest } from './AccessTokenRequest'
import { AuthorizationRequest } from './AuthorizationRequest'

export class Oauth2 {
	public authorizationRequest(baseUrl: string) {
		return new AuthorizationRequest(baseUrl)
	}

	public accessTokenRequest(baseUrl: string) {
		return new AccessTokenRequest(baseUrl)
	}

	public getUserRequest(baseUrl: string) {
		return new UserRequest(baseUrl)
	}

	// public getAuthorizationUrl() {
	// 	return `https://github.com/login/oauth/authorize?client_id=${this.clientId}`
	// }

	// public async getAccessToken(code: string) {
	// 	const response = await got.post<{access_token: string}>('https://github.com/login/oauth/access_token', {
	// 		responseType: 'json',
	// 		json: {
	// 			client_id: this.clientId,
	// 			client_secret: this.clientSecret,
	// 			code,
	// 		},
	// 	})

	// 	return response.body
	// }

	// public async getUser(accessToken: string) {
	// 	const response = await got.get<any>('https://api.github.com/user', {
	// 		responseType: 'json',
	// 		headers: {
	// 			'Authorization': `token ${accessToken}`,
	// 		},
	// 	})

	// 	return response.body
	// }
}
