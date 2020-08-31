import User from 'App/Models/User'
import Route from '@ioc:Adonis/Core/Route'
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

	public async socialRedirect({ response }: HttpContextContract) {
		const redirectUrl = new Oauth2()
			.authorizationRequest('https://github.com/login/oauth/authorize')
			.qs('client_id', Config.get('services.github.clientId'))
			.qs('scope', 'user:email')
			.makeUrl()

		response.redirect(redirectUrl)
	}

	public async socialCallback({ request, params, response }: HttpContextContract) {
		const redirectUrl = 'http://localhost:3000/oauth/callback'

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
			response.redirect().withQs({
				error: `Request to authenticate with ${params.provider} has failed`,
			}).toPath(redirectUrl)
			return
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
		let email = oauthUser.body.email
		const avatarUrl = oauthUser.body.avatar_url

		if (!email) {
			const emails = await new Oauth2()
			.getUserRequest('https://api.github.com/user/emails')
			.field('client_id', Config.get('services.github.clientId'))
			.field('client_secret', Config.get('services.github.clientSecret'))
			.acceptJSON()
			.sendJSON()
			.header('Authorization', `token ${accessToken.body.access_token}`)
			.get()


			if (Array.isArray(emails.body)) {
				const verifiedEmail = emails.body.find((row: any) => row && row.verified === true)
				email = verifiedEmail ? verifiedEmail.email : null
			}
		}

		/**
		 * Still unable to find email address
		 */
		if (!email) {
			response.redirect().withQs({
				error: `Your privacy settings doesnt allow ${params.provider} to share your email with us`,
			}).toPath(redirectUrl)
			return
		}

		/**
		 * Create or fetch existing user
		 */
		const user = await User.firstOrCreate(
			{ email: email },
			{
				fullName: name,
				avatarUrl: avatarUrl,
				accountSource: 'github',
			}
		)

		response.redirect().withQs({
			exchange_url: Route.makeSignedUrl('UsersController.exchangeToken', {
				qs: {
					id: user.id
				},
			})
		}).toPath(redirectUrl)
	}

	public async exchangeToken({ request, response, auth }: HttpContextContract) {
		if (!request.hasValidSignature()) {
			return response.status(400).send({
				errors: [{ message: 'Invalid code' }]
			})
		}

		const user = await User.findOrFail(request.input('id'))
		await auth.login(user)
		return { ok: true }
	}

	public me({ auth }: HttpContextContract) {
		return {
			data: auth.user,
		}
	}
}
