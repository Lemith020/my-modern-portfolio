import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Hourglass } from "lucide-react";
import { FaGithub, FaReact, FaHtml5, FaCss3Alt, FaPhp } from "react-icons/fa";
import { SiJavascript, SiMongodb, SiExpress, SiNodedotjs, SiMysql, SiPython } from "react-icons/si";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { studioRequest } from "@/lib/article-studio-api";
import { PROJECT_CATEGORIES } from "@/lib/project-studio-types";
import type { ProjectCategory, PublicProject } from "@/lib/project-studio-types";
import { ProjectStudio } from "@/components/ProjectStudio";

const techDetails: Record<string, { icon: React.ReactNode; color: string }> = {
  "React": { icon: <FaReact className="h-3.5 w-3.5" />, color: "text-[#61DAFB] border-[#61DAFB]/30 bg-[#61DAFB]/5" },
  "HTML": { icon: <FaHtml5 className="h-3.5 w-3.5" />, color: "text-[#E34F26] border-[#E34F26]/30 bg-[#E34F26]/5" },
  "CSS": { icon: <FaCss3Alt className="h-3.5 w-3.5" />, color: "text-[#1572B6] border-[#1572B6]/30 bg-[#1572B6]/5" },
  "JavaScript": { icon: <SiJavascript className="h-3.5 w-3.5 rounded-[2px]" />, color: "text-[#F7DF1E] border-[#F7DF1E]/30 bg-[#F7DF1E]/5 dark:text-[#F7DF1E]" },
  "PHP": { icon: <FaPhp className="h-3.5 w-3.5" />, color: "text-[#777BB4] border-[#777BB4]/30 bg-[#777BB4]/5" },
  "MySQL": { icon: <SiMysql className="h-3.5 w-3.5" />, color: "text-[#4479A1] border-[#4479A1]/30 bg-[#4479A1]/5" },
  "MongoDB": { icon: <SiMongodb className="h-3.5 w-3.5" />, color: "text-[#47A248] border-[#47A248]/30 bg-[#47A248]/5" },
  "Express.js": { icon: <SiExpress className="h-3.5 w-3.5" />, color: "text-foreground border-foreground/20 bg-foreground/5" },
  "Node.js": { icon: <SiNodedotjs className="h-3.5 w-3.5" />, color: "text-[#339933] border-[#339933]/30 bg-[#339933]/5" },
  "Python": { icon: <SiPython className="h-3.5 w-3.5" />, color: "text-[#3776AB] border-[#3776AB]/30 bg-[#3776AB]/5" },
};



const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "tween", ease: "easeOut", duration: 0.4 } 
  },
  hover: {
    scale: 1.03,
    backgroundColor: "rgba(16, 185, 129, 0.04)",
    borderColor: "rgba(16, 185, 129, 0.4)",
    boxShadow: "0 15px 30px -10px rgb(16 185 129 / 0.08)",
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  tap: { scale: 0.99 }
};

export function Projects() {
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");

  const queryClient = useQueryClient();
  const listing = useQuery({ queryKey: ["featured-projects"], queryFn: () => studioRequest<{ projects: PublicProject[] }>("projects-public"), staleTime: 0, retry: 1 });
  const projects = listing.data?.projects ?? [];
  const filteredProjects = projects.filter(p => filter === "All" || p.category === filter);

  return (
    <section id="projects" className="py-24 bg-emerald-50/10 dark:bg-emerald-950/5 transition-colors duration-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Projects</h2>
            <div className="w-12 h-1 bg-primary rounded-full mb-6"></div>
          </div>
          
          <div className="flex flex-wrap gap-2 bg-background/60 p-1.5 rounded-full border border-border/80 max-w-full relative backdrop-blur-sm">
            {(["All", ...PROJECT_CATEGORIES] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                aria-pressed={filter === cat}
                className={`px-5 py-2 rounded-full text-sm font-medium relative transition-colors duration-300 ${
                  filter === cat ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter === cat && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute inset-0 bg-emerald-600 dark:bg-emerald-500 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {listing.isPending && <p role="status" className="mb-6 text-sm text-muted-foreground">Loading projects...</p>}
        {listing.isError && <div role="alert" className="mb-6 flex flex-wrap items-center gap-3"><p>Projects could not be refreshed.</p><Button variant="outline" onClick={() => { void listing.refetch(); }}>Retry</Button></div>}
        {listing.isSuccess && !filteredProjects.length && <p className="py-8 text-muted-foreground">No published projects in this category yet.</p>}
        <motion.div 
          layout 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                variants={cardVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                whileHover="hover"
                whileTap="tap"
                className="group min-w-0 flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden select-none cursor-pointer will-change-transform"
              >
                {project.image && <div className="aspect-video w-full overflow-hidden bg-muted border-b border-border/50">
                  <img src={project.image} alt={`${project.title} preview`} width={1400} height={788} loading="lazy" className="h-full w-full object-cover" />
                </div>}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                      {project.category}
                    </Badge>
                    <div className="flex gap-2">
                      {project.github && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors" asChild>
                          <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Repo"><FaGithub className="h-4 w-4" /></a>
                        </Button>
                      )}
                      {project.demo && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors" asChild>
                          <a href={project.demo} target="_blank" rel="noopener noreferrer" aria-label="Live Demo"><ExternalLink className="h-4 w-4" /></a>
                        </Button>
                      )}
                      {project.isPending && (
                        <span className="flex items-center gap-1 text-xs font-mono text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md animate-pulse">
                          <Hourglass className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-2 break-words group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm flex-1 mb-6 leading-relaxed break-words">
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border/40">
                    {project.tech.map((t) => {
                      const details = techDetails[t] || { icon: null, color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5" };
                      return (
                        <Badge 
                          key={t}
                          variant="secondary" 
                          className={`flex items-center gap-1.5 py-1 px-2.5 text-xs font-mono font-semibold border transition-all duration-300 rounded-md ${details.color}`}
                        >
                          {details.icon && <span>{details.icon}</span>}
                          {t}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        <ProjectStudio onChanged={() => { void queryClient.invalidateQueries({ queryKey: ["featured-projects"] }); }} />
      </div>
    </section>
  );
}
