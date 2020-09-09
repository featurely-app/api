/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes/index.ts` as follows
|
| import './cart'
| import './customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

/**
 * Authenticate socially
 */
Route.group(() => {
	Route.get(':provider/redirect', 'OauthController.redirect')
	Route.get(':provider/callback', 'OauthController.callback')
	Route.get('exchange', 'OauthController.tokenExchange')
}).prefix('oauth')

/**
 * Login directly
 */
Route.group(() => {
	Route.post('tenants/register', 'TenantsController.register')
	Route.post('users/register', 'UsersController.register')
	Route.post('login', 'UsersController.login')
}).prefix('v1')

/**
 * Must be authenticated
 */
Route.group(() => {
	Route.get('me', 'UsersController.me')

	/**
	 * Create delete upvotes
	 */
	Route.post('projects/:id/posts', 'PostsController.store')
	Route.post('posts/:id/upvotes', 'PostUpvotesController.store')
	Route.delete('posts/:id/upvotes', 'PostUpvotesController.delete')

	/**
	 * Create/Edit/Delete threads
	 */
	Route.post('posts/:id/threads', 'ThreadsController.store')
	Route.put('threads/:id', 'ThreadsController.update')
	Route.delete('threads/:id', 'ThreadsController.delete')
})
	.prefix('v1')
	.middleware('auth')

/**
 * View public projects and posts
 */
Route.group(() => {
	Route.get('posts/:id', 'PostsController.show')
	Route.get('projects/:id', 'ProjectsController.show')
	Route.get('projects/:id/posts', 'PostsController.index')
	Route.get('posts/:id/threads', 'ThreadsController.index')
}).prefix('v1')
