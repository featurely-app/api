import User from 'App/Models/User'
import Tenant from 'App/Models/Tenant'
import Database from '@ioc:Adonis/Lucid/Database'
import RegisterUser from 'App/Validators/RegisterUserValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
	public async register({ request, response }: HttpContextContract) {
		const payload = await request.validate(RegisterUser)
		await Database.transaction(async (trx) => {
			const user = new User()
			user.email = payload.email
			user.password = payload.password
			user.accountSource = 'password'
			user.fullName = payload.full_name
			await user.useTransaction(trx).save()

			const tenant = new Tenant()
			tenant.subdomain = payload.subdomain
			tenant.businessName = payload.business_name
			tenant.useTransaction(trx)
			await tenant.related('owner').associate(user)
		})

		response.accepted({ ok: true })
	}

	public async login({ request, auth }: HttpContextContract) {
		await auth.attempt(request.input('email'), request.input('password'))
		return { ok: true }
	}
}
