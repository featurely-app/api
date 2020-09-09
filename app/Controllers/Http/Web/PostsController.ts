import Post from 'App/Models/Post'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostsController {
	public async show({ params, auth, view }: HttpContextContract) {
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

		return view.render('posts/show', { post })
	}
}
