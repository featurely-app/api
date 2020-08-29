import { schema, rules } from '@ioc:Adonis/Core/Validator'

/**
 * Validation schema for creating a new user
 */
export const userSchema = {
	email: schema.string({ trim: true }, [
		rules.email(),
		rules.unique({ table: 'users', column: 'email' }),
	]),
	password: schema.string({ trim: true }, [rules.minLength(6), rules.maxLength(50)]),
	fullName: schema.string({ trim: true }, [rules.maxLength(200)]),
}

/**
 * Validation messages
 */
export const messages = {
	'email.email': 'Invalid email address',
	'email.unique': 'The email address is already in use',
}
