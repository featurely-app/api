import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tenants extends BaseSchema {
	protected tableName = 'tenants'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.bigIncrements('id').notNullable().primary()
			table.bigInteger('user_id').notNullable().references('id').inTable('users')
			table.string('subdomain', 100).unique().notNullable()
			table.string('business_name', 350).notNullable()
			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
