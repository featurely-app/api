import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ProjectUser extends BaseModel {
	@column({ isPrimary: true })
	public id: number

	@column()
	public projectId: string

	@column()
	public userId: string

	@column()
	public role: 'owner' | 'member' | 'collaborator' | 'user'

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime
}
