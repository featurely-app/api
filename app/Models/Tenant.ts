import { DateTime } from 'luxon'
import User from 'App/Models/User'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class Tenant extends BaseModel {
	@column({ isPrimary: true })
	public id: string

	@column()
	public userId: string

	@column()
	public subdomain: string

	@column()
	public businessName: string

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	@belongsTo(() => User)
	public owner: BelongsTo<typeof User>
}
