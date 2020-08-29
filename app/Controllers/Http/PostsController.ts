import Post from 'App/Models/Post'
import Project from 'App/Models/Project'
import { SortOptions } from 'Contracts/enums'
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostsController {
	public async index({ params, request }: HttpContextContract) {
		const payload = await request.validate({
			schema: schema.create({
				sort: schema.enum.optional(Object.values(SortOptions)),
				filters: schema.object.optional().members({
					phase: schema.array.optional().members(schema.string()),
				}),
				page: schema.number.optional(),
			}),
		})

		const project = await Project.findOrFail(params.id)
		const query = project
			.related('posts')
			.query()
			.select('title', 'id', 'slug', 'createdAt', 'updatedAt', 'phaseId', 'userId')
			.withCount('upvotes')
			.withCount('threads')
			.preload('status')
			.preload('author')

		if (payload.sort) {
			query.apply((scopes) => scopes.sortBy(payload.sort!))
		}

		if (payload.filters?.phase) {
			query.apply((scopes) => scopes.filterByPhase(payload.filters?.phase!))
		}

		const posts = await query.paginate(payload.page || 1, 30)
		return {
			meta: {
				total: posts.total,
				perPage: posts.perPage,
				currentPage: posts.currentPage,
				lastPage: posts.lastPage,
				firstPage: posts.firstPage
			},
			data: posts.all()
		}
	}

	public async show({ params }: HttpContextContract) {
		const post = await Post.query()
			.withCount('upvotes')
			.withCount('threads')
			.preload('status')
			.preload('author')
			.where('id', params.id)
			.firstOrFail()

		return {
			data: post,
		}
	}
}
