import { DateTime } from 'luxon'
import Post from 'App/Models/Post'
import User from 'App/Models/User'
import Slugify from 'App/Models/Traits/Slugify'
import ProjectPhase from 'App/Models/ProjectPhase'
import { BaseModel, column, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'

export default class Project extends BaseModel {
	@column({ isPrimary: true })
	public id: string

	@column({ serializeAs: null })
	public tenantId: string

	@column()
	public name: string

	@column()
	public slug: string

	@column()
	public logoUrl?: string

	@column()
	public description: string

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	@hasMany(() => Post)
	public posts: HasMany<typeof Post>

	@hasMany(() => ProjectPhase)
	public statuses: HasMany<typeof ProjectPhase>

	@manyToMany(() => User, { pivotTable: 'project_users' })
	public users: ManyToMany<typeof User>
}

Slugify(Project, 'name')
