import Post from 'App/Models/Post'
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ThreadsController {
	public async index({ params, request }: HttpContextContract) {
		const payload = await request.validate({
			schema: schema.create({
				page: schema.number.optional(),
			}),
		})

		const post = await Post.findOrFail(params.id)

		const threads = await post
			.related('threads')
			.query()
			.orderBy('id', 'desc')
			.preload('author')
			.paginate(payload.page || 1, 20)

		return {
			meta: {
				total: threads.total,
				perPage: threads.perPage,
				currentPage: threads.currentPage,
				lastPage: threads.lastPage,
				firstPage: threads.firstPage,
			},
			data: threads.all(),
		}
	}
}
