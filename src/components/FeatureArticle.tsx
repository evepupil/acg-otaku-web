import { markdownToHtml } from '@/lib/articles'

interface FeatureArticleProps {
  content: string
}

export default async function FeatureArticle({ content }: FeatureArticleProps) {
  if (!content) {
    return null
  }

  const htmlContent = await markdownToHtml(content)

  return (
    <article
      className="prose prose-lg max-w-none
        prose-headings:text-slate-900 prose-headings:font-semibold
        prose-p:text-slate-600 prose-p:leading-8
        prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-2xl prose-img:shadow-lg
        prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50/60 prose-blockquote:rounded-r-2xl
        prose-code:text-emerald-700 prose-code:bg-emerald-50 prose-code:px-1 prose-code:rounded"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
