import { join } from 'path'
import { readFile } from 'fs-extra'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { TenantFactory } from 'Database/factories/User'

export default class AppSeeder extends BaseSeeder {
	public async run() {
		// await Tenant.truncate(true)
		// await User.truncate(true)

		await this.client.transaction(async (trx) => {
			const tenant = await TenantFactory.merge({
				subdomain: 'adonisjs',
				businessName: 'AdonisJS',
			})
				.client(trx)
				.with('owner', 1, (factory) => {
					factory.merge({
						fullName: 'Harminder Virk',
						email: 'virk@adonisjs.com',
						password: 'secret',
						accountSource: 'password',
					})
				})
				.create()

			tenant.useTransaction(trx)

			const project = await tenant.related('projects').create({
				name: 'AdonisJS v5',
				description:
					'Project covers the tasks to be accomplished in order to release the final stable version of AdonisJS v5',
				logoUrl: 'https://preview.adonisjs.com/img/adonis-banner.svg',
			})

			const statuses = await project.related('statuses').createMany([
				{
					name: 'Open',
					order: 1,
				},
				{
					name: 'Planned',
					order: 2,
				},
				{
					name: 'In Progress',
					order: 3,
				},
				{
					name: 'Closed',
					order: 4,
				},
				{
					name: 'Completed',
					order: 5,
				},
				{
					name: 'Shipped',
					order: 6,
				},
			])

			await project.related('posts').create({
				userId: tenant.owner.id,
				phaseId: statuses[2].id,
				title: 'Adding support for validations and cache in Env provider',
				description: await readFile(
					join(__dirname, '..', 'fixtures', 'env-validations.md'),
					'utf-8'
				),
			})

			await project.related('posts').create({
				userId: tenant.owner.id,
				phaseId: statuses[3].id,
				title: 'Collect.js - Add Laravel Collections (Illuminate/Collections) to Adonis',
				description: await readFile(
					join(__dirname, '..', 'fixtures', 'laravel-collections.md'),
					'utf-8'
				),
			})
		})
	}
}
