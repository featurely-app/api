import Project from 'App/Models/Project'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ProjectsController {
	public async show({ params }: HttpContextContract) {
		const project = await Project.findOrFail(params.id)
		await project.preload('phases', (query) => {
			query.orderBy('order', 'asc').withCount('posts')
		})

		return {
			data: project,
		}
	}
}
