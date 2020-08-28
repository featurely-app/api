import slugify from '@slynova/slug'
import { LucidModel, LucidRow } from '@ioc:Adonis/Lucid/Model'

/**
 * Register a model hook to generate slugs. Generated slugs doesn't
 * guarantee uniqueness and gets updated after every update.
 */
export default function <Model extends LucidModel & { new (): LucidRow & { slug: string } }>(
	model: Model,
	formField: Exclude<
		{
			[P in keyof InstanceType<Model>]: InstanceType<Model>[P] extends string ? P : never
		}[keyof InstanceType<Model>],
		'slug'
	>
) {
	if (typeof formField !== 'string') {
		throw new Error(`The value of "${formField}" must be a string to generate a slug`)
	}

	model.before('save', (modelInstance) => {
		if (modelInstance.$dirty[formField]) {
			modelInstance.slug = slugify(modelInstance[formField])
		}
	})
}
