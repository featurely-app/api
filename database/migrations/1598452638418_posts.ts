import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Posts extends BaseSchema {
	protected tableName = 'posts'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.bigIncrements('id').notNullable().primary()
			table.bigInteger('project_id').notNullable().references('id').inTable('projects')
			table.bigInteger('phase_id').notNullable().references('id').inTable('project_phases')
			table.bigInteger('user_id').notNullable().references('id').inTable('users')
			table.string('title', 500).notNullable()
			table.string('slug', 500).notNullable()

			table.text('description', 'longtext').notNullable()
			table.text('html', 'longtext').notNullable()
			table.string('excerpt', 300).notNullable()
      table.integer('todos', 4).notNullable().defaultTo(0)
      table.integer('completed_todos', 4).notNullable().defaultTo(0)

			table.timestamp('last_activity_at').notNullable()
			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
