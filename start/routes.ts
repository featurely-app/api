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

Route.group(() => {
	Route.post('tenants/register', 'TenantsController.register')
	Route.post('users/register', 'UsersController.register')
	Route.post('login', 'UsersController.login')
	Route.get('projects/:id', 'ProjectsController.show')
	Route.get('projects/:id/posts', 'PostsController.index')
	Route.get('posts/:id', 'PostsController.show')
	Route.get('posts/:id/threads', 'ThreadsController.index')

	Route.group(() => {
		Route.post('posts/:id/upvotes', 'PostUpvotesController.store')
		Route.delete('posts/:id/upvotes', 'PostUpvotesController.store')
	}).middleware('auth')
}).prefix('v1')
