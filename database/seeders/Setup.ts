import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { TenantFactory, UserFactory } from 'Database/factories/User'
import { ProjectFactory, PostFactory } from 'Database/factories/Project'

export default class TenantSeeder extends BaseSeeder {
	public async run() {
		await this.client.transaction(async (trx) => {
			const tenant = await TenantFactory.with('owner').client(trx).create()
			const users = await UserFactory.createMany(5)
			const projects = await ProjectFactory.merge({ tenantId: tenant.id }).client(trx).createMany(3)

			for (let project of projects) {
				project.useTransaction(trx)

				const phases = await project.related('phases').createMany([
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
						name: 'Awaiting Feedback',
						order: 4,
					},
					{
						name: 'Blocked',
						order: 5,
					},
					{
						name: 'Completed',
						order: 6,
					},
				])

				const postPhases = new Array(30).fill(1).map(() => {
					return {
						phaseId: phases[Math.floor(Math.random() * (phases.length - 0) + 0)].id,
						projectId: project.id,
						userId: tenant.owner.id,
					}
				})

				await PostFactory.merge(postPhases)
					.client(trx)
					.with('threads', 20, (factory) => {
						factory.merge({
							userId: users[Math.floor(Math.random() * (users.length - 0) + 0)].id,
						})
					})
					.with('upvotes', Math.floor(Math.random() * (20 - 1) + 1), (factory) => {
						factory.merge({
							userId: users[Math.floor(Math.random() * (phases.length - 0) + 0)].id,
						})
					})
					.createMany(30)
			}
		})
	}
}
