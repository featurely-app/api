import { DateTime } from 'luxon'
import { SortOptions } from 'Contracts/enums'

import User from 'App/Models/User'
import PostThread from 'App/Models/PostThread'
import PostUpvote from 'App/Models/PostUpvote'
import Slugify from 'App/Models/Traits/Slugify'
import ProjectPhase from 'App/Models/ProjectPhase'

import {
	column,
	scope,
	BaseModel,
	belongsTo,
	BelongsTo,
	hasMany,
	HasMany,
	computed,
} from '@ioc:Adonis/Lucid/Orm'

export default class Post extends BaseModel {
	@column({ isPrimary: true })
	public id: number

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

	@column()
	public description: string

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	@belongsTo(() => ProjectPhase, {
		foreignKey: 'phaseId',
	})
	public status: BelongsTo<typeof ProjectPhase>

	@hasMany(() => PostUpvote)
	public upvotes: HasMany<typeof PostUpvote>

	@hasMany(() => PostThread)
	public threads: HasMany<typeof PostThread>

	@belongsTo(() => User)
	public author: BelongsTo<typeof User>

	@computed()
	public get upvotesCount() {
		return this.$extras.upvotes_count === undefined ? undefined : Number(this.$extras.upvotes_count)
	}

	@computed()
	public get threadsCount() {
		return this.$extras.threads_count === undefined ? undefined : Number(this.$extras.threads_count)
	}

	public static sortBy = scope((query, sortOption: SortOptions) => {
		if (sortOption === 'latest') {
			query.orderBy('updatedAt', 'desc')
			return
		}

		if (sortOption === 'popular') {
			query.orderBy('upvotes_count', 'desc')
		}
	})

	public static filterByPhase = scope((query, phases: string[]) => {
		query.whereIn('phaseId', phases)
	})

	public serialize() {
		return super.serialize({
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
