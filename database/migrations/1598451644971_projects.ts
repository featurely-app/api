import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Projects extends BaseSchema {
	protected tableName = 'projects'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.bigIncrements('id').notNullable().primary()
			table.bigInteger('tenant_id').notNullable().references('id').inTable('tenants')
			table.string('name', 256).notNullable()
			table.string('slug', 256).notNullable()
			table.string('logo_url').nullable()
			table.text('description', 'longtext').nullable()
			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
