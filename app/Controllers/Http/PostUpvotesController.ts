import { DateTime } from 'luxon'
import Post from 'App/Models/Post'
import Database from '@ioc:Adonis/Lucid/Database'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostUpvotesController {
	public async store({ auth, params }: HttpContextContract) {
		const post = await Database.transaction(async (trx) => {
			const post = await Post.findOrFail(params.id, { client: trx })
			await post.related('upvotes').firstOrCreate({ userId: auth.user!.id })

			post.lastActivityAt = DateTime.local()
			await post.save()
			return post
		})

		const totalUpvotes = await post.related('upvotes').query().count('* as total')
		return { upvotesTotal: Number(totalUpvotes[0].total) }
	}

	public async delete({ auth, params }: HttpContextContract) {
		const post = await Post.findOrFail(params.id)
		await post.related('upvotes').query().where('userId', auth.user!.id).delete()
		const totalUpvotes = await post.related('upvotes').query().count('* as total')
		return { upvotesTotal: Number(totalUpvotes[0].total) }
	}
}
