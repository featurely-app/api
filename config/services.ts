import Env from '@ioc:Adonis/Core/Env'

export const github = {
	clientId: Env.getOrFail('GITHUB_CLIENT_ID') as string,
	clientSecret: Env.getOrFail('GITHUB_CLIENT_SECRET') as string,
}
