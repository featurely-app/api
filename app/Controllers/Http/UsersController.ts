import User from 'App/Models/User'
import UserRegistration from 'App/Validators/UserRegistration'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
	/**
	 * Create a new user account
	 */
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

	/**
	 * Login user using email/password
	 */
	public async login({ request, auth }: HttpContextContract) {
		await auth.attempt(request.input('email'), request.input('password'))
		return { ok: true }
	}

	/**
	 * Returns user details
	 */
	public me({ auth }: HttpContextContract) {
		return {
			data: auth.user,
		}
	}
}
