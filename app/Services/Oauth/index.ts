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
}
