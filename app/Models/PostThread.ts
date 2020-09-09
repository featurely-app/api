import { DateTime } from 'luxon'
import User from 'App/Models/User'
import {
	BaseModel,
	column,
	BelongsTo,
	belongsTo,
	computed,
	beforeSave,
} from '@ioc:Adonis/Lucid/Orm'
import MarkdownProcessor from 'App/Services/MarkdownProcessor'

export default class PostThread extends BaseModel {
	@column({ isPrimary: true })
	public id: string

	@column({ serializeAs: null })
	public postId: string

	@column({ serializeAs: null })
	public userId: string

	@column({ serializeAs: null })
	public comment: string

	@column({ serializeAs: null })
	public html: string

	@column()
	public excerpt: string

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	@belongsTo(() => User)
	public author: BelongsTo<typeof User>

	@computed()
	public get content() {
		if (!this.html || !this.comment) {
			return
		}

		return {
			text: this.comment,
			html: this.html,
		}
	}

	/**
	 * Generate HTML for the thread before saving it
	 */
	@beforeSave()
	public static async generateHtml(thread: PostThread) {
		if (thread.$dirty.comment) {
			const { html, excerpt } = await MarkdownProcessor.process(thread.comment)
			console.log(excerpt)
			thread.html = html
			thread.excerpt = excerpt
		}
	}

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
