import Post from 'App/Models/Post'
import Markdown from '@dimerapp/markdown'
import Project from 'App/Models/Project'
import { SortOptions } from 'Contracts/enums'
import { schema } from '@ioc:Adonis/Core/Validator'
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

		query.apply((scopes) => scopes.sortBy(payload.sort || SortOptions.latest))
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

	public async show({ params, auth, request, view }: HttpContextContract) {
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

		const html = await new Markdown(post.description).toHTML()
		post.$extras.html = html.contents

		if (request.url().startsWith('/web')) {
			return view.render('post', { post })
		}

		return {
			data: post.serialize({ omit: ['description'] }),
		}
	}
}
