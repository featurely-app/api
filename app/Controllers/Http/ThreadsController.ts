import { DateTime } from 'luxon'
import Post from 'App/Models/Post'
import PostThread from 'App/Models/PostThread'
import Database from '@ioc:Adonis/Lucid/Database'
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
			.orderBy('createdAt', 'asc')
			.preload('author')
			.paginate(payload.page || 1, 100)

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

	public async store({ request, params, auth }: HttpContextContract) {
		const payload = await request.validate({
			schema: schema.create({
				comment: schema.string(),
			}),
		})

		const thread = await Database.transaction(async (trx) => {
			const post = await Post.findOrFail(params.id, { client: trx })
			const thread = await post
				.related('threads')
				.create({ userId: auth.user!.id, comment: payload.comment })

			post.lastActivityAt = DateTime.local()
			await post.save()
			return thread
		})

		return {
			data: thread,
		}
	}

	public async update({ request, params, auth, response }: HttpContextContract) {
		const payload = await request.validate({
			schema: schema.create({
				comment: schema.string(),
			}),
		})

		const thread = await PostThread.findOrFail(params.id)
		response.abortIf(thread.userId !== auth.user!.id, {
			errors: [{ message: 'Unauthorized to modify comment' }],
		})

		thread.comment = payload.comment
		await thread.save()

		return {
			data: thread,
		}
	}

	public async delete({ response, auth, params }: HttpContextContract) {
		const thread = await PostThread.findOrFail(params.id)
		response.abortIf(thread.userId !== auth.user!.id, {
			errors: [{ message: 'Unauthorized to modify comment' }],
		})

		await thread.delete()
		return { ok: true }
	}
}
