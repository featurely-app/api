import User from 'App/Models/User'
import { Oauth2 } from 'App/Services/Oauth'
import Config from '@ioc:Adonis/Core/Config'
import UserRegistration from 'App/Validators/UserRegistration'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
	public async register({ request, response, auth }: HttpContextContract) {
		const payload = await request.validate(UserRegistration)

		const user = new User()
		user.email = payload.email
		user.password = payload.password
		user.accountSource = 'password'
		user.fullName = payload.fullName
		await user.save()

		await auth.login(user)
		response.accepted({ ok: true })
	}

	public async login({ request, auth }: HttpContextContract) {
		await auth.attempt(request.input('email'), request.input('password'))
		return { ok: true }
	}

	public async socialRedirect({ response, request }: HttpContextContract) {
		const referer = request.input('referer', request.header('referer'))
		response.cookie('redirectTo', referer, { sameSite: 'none' })

		const redirectUrl = new Oauth2()
			.authorizationRequest('https://github.com/login/oauth/authorize')
			.qs('client_id', Config.get('services.github.clientId'))
			.makeUrl()

		response.redirect(redirectUrl)
	}

	public async socialCallback({ request, auth, response, view }: HttpContextContract) {
		/**
		 * Read redirectTo value
		 */
		const redirectTo = request.cookie('redirectTo', '/')
		response.clearCookie('redirectTo')

		/**
		 * Get access token
		 */
		const accessToken = await new Oauth2()
			.accessTokenRequest('https://github.com/login/oauth/access_token')
			.field('client_id', Config.get('services.github.clientId'))
			.field('client_secret', Config.get('services.github.clientSecret'))
			.acceptJSON()
			.sendJSON()
			.field('code', request.input('code'))
			.post()

		if (!accessToken.body.access_token) {
			return view.render('errors/oauth-failure', { redirectTo })
		}

		/**
		 * Get user details
		 */
		const oauthUser = await new Oauth2()
			.getUserRequest('https://api.github.com/user')
			.field('client_id', Config.get('services.github.clientId'))
			.field('client_secret', Config.get('services.github.clientSecret'))
			.acceptJSON()
			.sendJSON()
			.header('Authorization', `token ${accessToken.body.access_token}`)
			.get()

		const name = oauthUser.body.name
		const email = oauthUser.body.email
		const avatarUrl = oauthUser.body.avatar_url
		if (!email) {
			return view.render('errors/oauth-failure', { redirectTo })
		}

		/**
		 * Create or fetch existing user
		 */
		const user = await User.firstOrCreate({ email: email }, {
			fullName: name,
			avatarUrl: avatarUrl,
			accountSource: 'github',
		})

		/**
		 * Login and redirect
		 */
		await auth.login(user)
		response.redirect(redirectTo)
	}
}
