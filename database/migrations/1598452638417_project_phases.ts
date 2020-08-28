import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ProjectPhases extends BaseSchema {
	protected tableName = 'project_phases'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.bigIncrements('id').notNullable().primary()
			table.bigInteger('project_id').notNullable().references('id').inTable('projects')
			table.string('name', 200).notNullable()
			table.integer('order', 4).notNullable()
			table.string('slug', 200).notNullable()
			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
