import { DateTime } from 'luxon'
import User from 'App/Models/User'
import { SortOptions } from 'Contracts/enums'
import PostThread from 'App/Models/PostThread'
import PostUpvote from 'App/Models/PostUpvote'
import Slugify from 'App/Models/Traits/Slugify'
import Database from '@ioc:Adonis/Lucid/Database'
import ProjectPhase from 'App/Models/ProjectPhase'
import MarkdownProcessor from 'App/Services/MarkdownProcessor'

import {
	column,
	scope,
	BaseModel,
	belongsTo,
	BelongsTo,
	hasMany,
	HasMany,
	computed,
	beforeSave,
} from '@ioc:Adonis/Lucid/Orm'

export default class Post extends BaseModel {
	@column({ isPrimary: true })
	public id: string

	@column({ serializeAs: null })
	public projectId: string

	@column({ serializeAs: null })
	public userId: string

	@column({ serializeAs: null })
	public phaseId: string

	@column()
	public title: string

	@column()
	public slug: string

	@column({ serializeAs: null })
	public description: string

	@column({ serializeAs: null })
	public html: string

	@column()
	public excerpt: string

	@column({ serializeAs: null })
	public todos: number

	@column({ serializeAs: null })
	public todosCompleted: number

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public lastActivityAt: DateTime

	@belongsTo(() => ProjectPhase, { foreignKey: 'phaseId' })
	public status: BelongsTo<typeof ProjectPhase>

	@hasMany(() => PostUpvote)
	public upvotes: HasMany<typeof PostUpvote>

	@hasMany(() => PostThread)
	public threads: HasMany<typeof PostThread>

	@belongsTo(() => User)
	public author: BelongsTo<typeof User>

	@computed()
	public get upvotedByMe() {
		return !!this.$extras.is_upvoted
	}

	@computed()
	public get upvotesCount() {
		return this.$extras.upvotes_count === undefined ? undefined : Number(this.$extras.upvotes_count)
	}

	@computed()
	public get threadsCount() {
		return this.$extras.threads_count === undefined ? undefined : Number(this.$extras.threads_count)
	}

	@computed()
	public get content() {
		if (!this.html || !this.description) {
			return
		}

		return {
			html: this.html,
		}
	}

	public static sortBy = scope((query, sortOption: SortOptions) => {
		if (sortOption === 'newest') {
			query.orderBy('createdAt', 'desc')
			return
		}

		if (sortOption === 'most_voted') {
			query.orderBy('upvotes_count', 'desc')
		}
	})

	/**
	 * Scope to filter the post by its status
	 */
	public static filterByStatus = scope((query, phases: string) => {
		query.whereIn('phaseId', phases.split(','))
	})

	/**
	 * Adds a boolean to the query when post is liked by a user
	 */
	public static findUserUpvotes = scope((query, userId: string) => {
		query.select(
			Database.raw(
				`SELECT
			CASE
				WHEN user_id = null
				THEN 0
				ELSE 1
			END as is_upvoted
			FROM post_upvotes
			WHERE posts.id = post_upvotes.post_id
			AND user_id = (?)
			LIMIT 1`,
				[userId]
			).wrap('(', ')')
		)
	})

	/**
	 * Generate HTML for the post before saving it
	 */
	@beforeSave()
	public static async generateHtml(post: Post) {
		if (post.$dirty.description) {
			const { html, excerpt } = await MarkdownProcessor.process(post.description)
			console.log(excerpt)
			post.html = html
			post.excerpt = excerpt
		}
	}

	public serialize(fields?: any) {
		return super.serialize({
			fields: fields,
			relations: {
				phase: {
					fields: {
						omit: ['created_at', 'updated_at', 'order'],
					},
				},
				author: {
					fields: {
						omit: ['created_at', 'updated_at'],
					},
				},
			},
		})
	}
}

Slugify(Post, 'title')
