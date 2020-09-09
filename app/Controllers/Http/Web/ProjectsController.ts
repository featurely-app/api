import Project from 'App/Models/Project'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ProjectsController {
	public async show({ params, auth, view }: HttpContextContract) {
		const project = await Project.query()
			.preload('statuses', (query) => query.withCount('posts'))
			.preload('posts', (query) => {
				query
					.withCount('upvotes')
					.withCount('threads')
					.preload('status')
					.preload('author')
					.apply((scopes) => {
						if (auth.user) {
							scopes.findUserUpvotes(auth.user.id)
						}
					})
			})
			.where('id', params.id)
			.firstOrFail()

		return view.render('projects/show', { project })
	}
}
