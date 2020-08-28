import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

const SUBDOMAIN_BLACKLIST = [
	'adonisjs',
	'edge',
	'indicative',
	'virk',
	'www',
	'www1',
	'www2',
	'wwww',
	'xhtml',
	'xxx',
	'xml',
	'sysadmin',
	'admin',
	'super',
	'manager',
	'github',
	'application',
	'api',
	'app',
	'alpha'
]

export default class RegisterUserValidator {
  constructor (private ctx: HttpContextContract) {
  }

  /**
   * Defining a schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
		email: schema.string({ trim: true }, [
			rules.email(),
			rules.unique({ table: 'users', column: 'email' }),
		]),
		password: schema.string({ trim: true }, [
			rules.minLength(6),
			rules.maxLength(50),
		]),
		full_name: schema.string({ trim: true }, [
			rules.maxLength(200),
		]),
		subdomain: schema.string({ trim: true }, [
			rules.regex(/^[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?$/),
			rules.minLength(3),
			rules.blacklist(SUBDOMAIN_BLACKLIST),
			rules.unique({ table: 'tenants', column: 'subdomain' }),
		]),
		business_name: schema.string({ trim: true }, [
			rules.minLength(3),
			rules.maxLength(200),
		])
	})

  /**
   * The `schema` first gets compiled to a reusable function and then that compiled
   * function validates the data at runtime.
   *
   * Since, compiling the schema is an expensive operation, you must always cache it by
   * defining a unique cache key. The simplest way is to use the current request route
   * key, which is a combination of the route pattern and HTTP method.
   */
  public cacheKey = this.ctx.routeKey

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
  */
  public messages = {
  	'subdomain.blacklist': 'The subdomain is not available',
  	'subdomain.minLength': 'The subdomain must be 3 characters long',
  	'subdomain.unique': 'The subdomain is not available',
  	'email.unique': 'The email address is already in use'
  }
}
