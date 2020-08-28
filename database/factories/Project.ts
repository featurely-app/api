import Post from 'App/Models/Post'
import Project from 'App/Models/Project'
import PostUpvote from 'App/Models/PostUpvote'
import PostThread from 'App/Models/PostThread'
import Factory from '@ioc:Adonis/Lucid/Factory'

export const ProjectFactory = Factory.define(Project, ({ faker }) => {
	return {
		name: faker.lorem.sentence(1),
		description: faker.lorem.paragraphs(2),
	}
})
	.relation('posts', () => PostFactory)
	.build()

export const PostFactory = Factory.define(Post, ({ faker }) => {
	return {
		title: faker.lorem.words(Math.floor(Math.random() * (10 - 4) + 4)),
		description: faker.lorem.paragraphs(2),
	}
})
	.relation('upvotes', () => PostUpvoteFactory)
	.relation('threads', () => PostThreadFactory)
	.build()

export const PostThreadFactory = Factory.define(PostThread, ({ faker }) => {
	return {
		comment: faker.lorem.paragraphs(8),
	}
}).build()

export const PostUpvoteFactory = Factory.define(PostUpvote, () => {
	return {}
}).build()
