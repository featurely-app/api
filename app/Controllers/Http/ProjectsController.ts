import Project from 'App/Models/Project'
import { SortOptions } from 'Contracts/enums'
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ProjectsController {
	public async show({ params, request, view, auth }: HttpContextContract) {
		const project = await Project.findOrFail(params.id)
		await project.preload('statuses', (query) => query.withCount('posts'))

		if (request.url().startsWith('/web')) {
			const payload = await request.validate({
				schema: schema.create({
					sort: schema.enum.optional(Object.values(SortOptions)),
					filters: schema.object.optional().members({
						phase: schema.string(),
					}),
					page: schema.number.optional(),
				}),
			})

			const query = project
				.related('posts')
				.query()
				.select('title', 'id', 'slug', 'createdAt', 'updatedAt', 'phaseId', 'userId')
				.withCount('upvotes')
				.withCount('threads')
				.preload('status')
				.preload('author')
				.apply((scopes) => {
					if (auth.user) {
						scopes.findUserUpvotes(auth.user.id)
					}
				})

			if (payload.sort) {
				query.apply((scopes) => scopes.sortBy(payload.sort!))
			}

			if (payload.filters?.phase) {
				query.apply((scopes) => scopes.filterByStatus(payload.filters?.phase!))
			}

			const posts = await query.paginate(payload.page || 1, 30)
			return view.render('project', { project, posts })
		}

		return {
			data: project,
		}
	}
}
