import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ProjectUsers extends BaseSchema {
	protected tableName = 'project_users'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.bigIncrements('id').notNullable().primary()
			table.bigInteger('project_id').notNullable().references('id').inTable('projects')
			table.bigInteger('user_id').notNullable().references('id').inTable('users')
			table.enum('role', ['owner', 'member', 'collaborator', 'user']).notNullable()
			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
