import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
	@column({ isPrimary: true })
	public id: string

	@column()
	public email: string

	@column({ serializeAs: null })
	public password: string

	@column()
	public fullName?: string

	@column()
	public avatarUrl: string

	@column({ serializeAs: null })
	public accountSource: 'password' | 'github' | 'twitter' | 'google'

	@column({ serializeAs: null })
	public rememberMeToken?: string

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	@beforeSave()
	public static async hashPassword(user: User) {
		if (user.$dirty.password) {
			user.password = await Hash.make(user.password)
		}
	}

	@beforeSave()
	public static async normalizeUserPayload(user: User) {
		if (!user.fullName) {
			user.fullName = user.email.replace(/@.+/, '')
		}

		if (user.$dirty.fullName && !user.avatarUrl) {
			user.avatarUrl = `https://ui-avatars.com/api/?name=${user.fullName}`
		}
	}
}
