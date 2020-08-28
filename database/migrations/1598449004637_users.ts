import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
	protected tableName = 'users'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.bigIncrements('id').notNullable().primary()
			table.string('email', 256).notNullable().unique()
			table.string('full_name', 150).notNullable()
			table.string('avatar_url', 100).notNullable()
			table.string('password', 180).nullable()

			table.enu('account_source', ['password', 'github', 'twitter', 'google']).notNullable()

			table.string('remember_me_token').nullable()
			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
