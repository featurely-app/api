import { DateTime } from 'luxon'
import User from 'App/Models/User'
import { BaseModel, column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class PostThread extends BaseModel {
	@column({ isPrimary: true })
	public id: number

	@column({ serializeAs: null })
	public postId: string

	@column({ serializeAs: null })
	public userId: string

	@column()
	public comment: string

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	@belongsTo(() => User)
	public author: BelongsTo<typeof User>

	public serialize() {
		return super.serialize({
			relations: {
				author: {
					fields: {
						omit: ['created_at', 'updated_at'],
					},
				},
			},
		})
	}
}
