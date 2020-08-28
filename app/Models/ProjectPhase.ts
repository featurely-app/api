import { DateTime } from 'luxon'
import Slugify from 'App/Models/Traits/Slugify'
import Post from 'App/Models/Post'
import { BaseModel, column, hasMany, HasMany, computed } from '@ioc:Adonis/Lucid/Orm'

export default class ProjectPhase extends BaseModel {
	@column({ isPrimary: true })
	public id: string

	@column({ serializeAs: null })
	public projectId: string

	@column()
	public name: string

	@column()
	public order: number

	@column()
	public slug: string

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	@hasMany(() => Post, {
		foreignKey: 'phaseId',
	})
	public posts: HasMany<typeof Post>

	@computed({ serializeAs: 'posts_count' })
	public get postsCount() {
		return this.$extras.posts_count === undefined ? undefined : Number(this.$extras.posts_count)
	}
}

Slugify(ProjectPhase, 'name')
