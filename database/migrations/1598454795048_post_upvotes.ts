import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PostUpvotes extends BaseSchema {
	protected tableName = 'post_upvotes'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.bigIncrements('id').notNullable().primary()
			table.bigInteger('post_id').notNullable().references('id').inTable('posts')
			table.bigInteger('user_id').notNullable().references('id').inTable('users')
			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
