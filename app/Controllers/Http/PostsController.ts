import Post from 'App/Models/Post'
import Project from 'App/Models/Project'
import { SortOptions } from 'Contracts/enums'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostsController {
	public async index({ params, auth, request }: HttpContextContract) {
		const payload = await request.validate({
			schema: schema.create({
				sort: schema.enum.optional(Object.values(SortOptions)),
				filters: schema.object.optional().members({
					status: schema.string(),
				}),
				page: schema.number.optional(),
			}),
		})

		const project = await Project.findOrFail(params.id)
		const query = project
			.related('posts')
			.query()
			.select(
				'title',
				'id',
				'slug',
				'createdAt',
				'updatedAt',
				'phaseId',
				'userId',
				'lastActivityAt'
			)
			.withCount('upvotes')
			.withCount('threads')
			.preload('status')
			.preload('author')
			.apply((scopes) => {
				if (auth.user) {
					scopes.findUserUpvotes(auth.user.id)
				}
			})

		query.apply((scopes) => scopes.sortBy(payload.sort || SortOptions.newest))
		if (payload.filters?.status) {
			query.apply((scopes) => scopes.filterByStatus(payload.filters?.status!))
		}

		const posts = await query.paginate(payload.page || 1, 30)
		return {
			meta: {
				total: posts.total,
				perPage: posts.perPage,
				currentPage: posts.currentPage,
				lastPage: posts.lastPage,
				firstPage: posts.firstPage,
			},
			data: posts.all(),
		}
	}

	public async store({ request, params, auth }: HttpContextContract) {
		const payload = await request.validate({
			schema: schema.create({
				title: schema.string({ escape: true }),
				description: schema.string({}),
				statusId: schema.string({}, [
					rules.exists({ table: 'project_phases', column: 'id', where: { project_id: params.id } }),
				]),
			}),
		})

		const project = await Project.query()
			.where('id', params.id)
			// .whereHas('users', (query) => query.where('user_id', auth.user!.id))
			.firstOrFail()

		const post = await project.related('posts').create({
			title: payload.title,
			description: payload.description,
			phaseId: payload.statusId,
			userId: auth.user!.id,
		})

		return { data: post }
	}

	public async show({ params, auth }: HttpContextContract) {
		const post = await Post.query()
			.withCount('upvotes')
			.withCount('threads')
			.preload('status')
			.preload('author')
			.where('id', params.id)
			.apply((scopes) => {
				if (auth.user) {
					scopes.findUserUpvotes(auth.user.id)
				}
			})
			.firstOrFail()

		return {
			data: post.serialize({ omit: ['description'] }),
		}
	}
}
