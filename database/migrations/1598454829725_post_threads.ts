import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PostComments extends BaseSchema {
	protected tableName = 'post_threads'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.bigIncrements('id').notNullable().primary()
			table.bigInteger('post_id').notNullable().references('id').inTable('posts')
			table.bigInteger('user_id').notNullable().references('id').inTable('users')
			table.text('comment', 'longtext').notNullable()
			table.text('html', 'longtext').notNullable()
      table.string('excerpt', 300).notNullable()
			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
