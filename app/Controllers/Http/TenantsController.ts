import User from 'App/Models/User'
import Tenant from 'App/Models/Tenant'
import Database from '@ioc:Adonis/Lucid/Database'
import TenantRegistration from 'App/Validators/TenantRegistration'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TenantsController {
	public async register({ request, response, auth }: HttpContextContract) {
		const payload = await request.validate(TenantRegistration)

		const user = await Database.transaction(async (trx) => {
			const user = new User()
			user.email = payload.email
			user.password = payload.password
			user.accountSource = 'password'
			user.fullName = payload.fullName
			await user.useTransaction(trx).save()

			const tenant = new Tenant()
			tenant.subdomain = payload.subdomain
			tenant.businessName = payload.businessName
			tenant.useTransaction(trx)
			await tenant.related('owner').associate(user)

			return user
		})

		await auth.login(user)
		response.accepted({ ok: true })
	}
}
