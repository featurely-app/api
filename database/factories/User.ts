import User from 'App/Models/User'
import Tenant from 'App/Models/Tenant'
import Factory from '@ioc:Adonis/Lucid/Factory'

export const UserFactory = Factory.define(User, ({ faker }) => {
	return {
		email: faker.internet.email(),
		password: faker.internet.password(),
		fullName: `${faker.name.firstName()} ${faker.name.lastName()}`,
		avatarUrl: faker.internet.avatar(),
		accountSource: 'password' as const,
	}
}).build()

export const TenantFactory = Factory.define(Tenant, () => {
	return {
		subdomain: 'adonisjs',
		businessName: 'AdonisJS Corp',
	}
})
	.relation('owner', () => UserFactory)
	.build()
