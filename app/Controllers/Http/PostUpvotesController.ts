import Post from 'App/Models/Post'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostUpvotesController {
	public async store({ auth, params }: HttpContextContract) {
		const post = await Post.findOrFail(params.id)
		await post.related('upvotes').firstOrCreate({ userId: auth.user!.id })
		return { ok: true }
	}

	public async delete({ auth, params }: HttpContextContract) {
		const post = await Post.findOrFail(params.id)
		await post.related('upvotes').query().where('userId', auth.user!.id).delete()
		return { ok: true }
	}
}
