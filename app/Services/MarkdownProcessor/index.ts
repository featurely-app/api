import { Renderer } from 'dimer-edge'
import View from '@ioc:Adonis/Core/View'
import Markdown from '@dimerapp/markdown'
import { ShikiRenderer } from 'dimer-edge-shiki'

/**
 * Exposes the API to process markdown documents
 */
class MarkdownProcessor {
	private booted: boolean = false

	public async boot() {
		if (this.booted) {
			return
		}

		this.booted = true

		const shiki = new ShikiRenderer(__dirname)
		const renderer = new Renderer(View)
		renderer.use(shiki.handleCodeBlocks)
		await shiki.useTheme('github-light').boot()
		View.registerTemplate('markdown-renderer', { template: '@dimerTree(doc.contents.children)' })
	}

	public async process(text: string) {
		await this.boot()

		const doc = await new Markdown(text).toJSON()
		const html = View.render('markdown-renderer', { doc })
		return { html, excerpt: '' }
	}
}

export default new MarkdownProcessor()
