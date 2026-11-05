import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { articles } from "@/data/articles";

export function BlogArticles() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="blog" className="py-24 bg-background transition-colors duration-500 scroll-mt-16" aria-labelledby="field-notes-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-12">
          <h2 id="field-notes-heading" className="text-3xl font-bold mb-2">Field Notes</h2>
          <div className="w-12 h-1 bg-primary rounded-full" />
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">Thoughts on code, AI, and the things I learn along the way. Written on Medium.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => {
            const hasLink = !article.isSample && /^https:\/\//i.test(article.mediumUrl);
            const image = <img src={article.image} alt={article.imageAlt} width={1400} height={900} loading="lazy" className={`w-full h-full object-cover ${reduceMotion ? "" : "transition-transform duration-500 group-hover:scale-[1.025]"}`} />;

            return (
              <motion.article key={article.id} initial={reduceMotion ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: Math.min(index * 0.08, 0.24), duration: 0.4 }} className="group flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden hover:border-emerald-500/40 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-primary/25 transition-colors duration-300">
                <div className="relative aspect-video w-full overflow-hidden bg-muted border-b border-border/50">
                  {hasLink ? <a href={article.mediumUrl} target="_blank" rel="noopener noreferrer" aria-label={`Read ${article.title} on Medium (opens in a new tab)`} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">{image}</a> : image}
                  {article.isSample && <span className="absolute top-3 right-3 text-[10px] font-semibold bg-background/95 text-muted-foreground border border-border/70 rounded-full px-2.5 py-1">Sample article</span>}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-foreground text-base mb-1 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    {hasLink ? <a href={article.mediumUrl} target="_blank" rel="noopener noreferrer" className="rounded-sm focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4">{article.title}</a> : article.title}
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-3">{article.category}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed flex-1 mb-4">{article.description}</p>
                  <div className="mt-auto pt-3 border-t border-border/40">
                    {hasLink ? <a href={article.mediumUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-emerald-500 rounded-sm focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 transition-colors">Read on Medium <ArrowUpRight className="w-3.5 h-3.5" /></a> : <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><BookOpen className="w-3.5 h-3.5" /> Article coming soon</span>}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
