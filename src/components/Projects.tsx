import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Hourglass } from "lucide-react";
import { FaGithub, FaReact, FaHtml5, FaCss3Alt, FaPhp } from "react-icons/fa";
import { SiJavascript, SiMongodb, SiExpress, SiNodedotjs, SiMysql, SiPython } from "react-icons/si";

type ProjectCategory = "All" | "Frontend" | "Full Stack" | "AI/ML";

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

const projects = [
  {
    title: "Task Management System",
    description: "A MERN stack task management system built to organize, track, and manage daily development tasks efficiently.",
    category: "Full Stack",
    tech: ["MongoDB", "Express.js", "React", "Node.js", "HTML", "CSS"],
    github: "https://github.com/Lemith020/Manage-Task-List",
    demo: "#"
  },
  {
    title: "Simple Full-Stack Login Page",
    description: "A secure full-stack login and authentication interface utilizing PHP for server-side logic and MySQL databases managed via XAMPP.",
    category: "Full Stack",
    tech: ["PHP", "MySQL", "JavaScript", "HTML", "CSS"],
    github: "https://github.com/Lemith020/simple-fullstack-login-page",
    demo: "#"
  },
  {
    title: "Amazon UI Clone",
    description: "A pixel-perfect frontend replica of the Amazon e-commerce platform homepage to practice responsive web design and layouts.",
    category: "Frontend",
    tech: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/Lemith020/Amazon-clone.git",
    demo: "#"
  },
  {
    title: "Classic Snake Game",
    description: "A retro browser-based interactive grid game built logic-first using vanilla JavaScript and styled with clean CSS.",
    category: "Frontend",
    tech: ["JavaScript", "HTML", "CSS"],
    github: "https://github.com/Lemith020/snake-game.git",
    demo: "#"
  },
  {
    title: "Weather Application",
    description: "A real-time weather tracking application fetching current atmospheric updates and presenting them through a modern frontend dynamic UI.",
    category: "Frontend",
    tech: ["JavaScript", "HTML", "CSS"],
    github: "https://github.com/Lemith020/weater-app",
    demo: "#"
  },
  {
    title: "React Stopwatch",
    description: "A precision stopwatch component built during a comprehensive core React course to master hooks, rendering cycles, and state management.",
    category: "Frontend",
    tech: ["React", "JavaScript", "HTML", "CSS"],
    github: "https://github.com/Lemith020/React-Course",
    demo: "#"
  },
  {
    title: "AI/ML Research & Engineering Projects",
    description: "Intelligent systems, predictive models, and pipeline implementations currently conceptualized and pending for active development.",
    category: "AI/ML",
    tech: ["Python"],
    github: "#",
    demo: "#",
    isPending: true
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
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
  const [filter, setFilter] = useState<ProjectCategory>("All");

  const filteredProjects = projects.filter(p => filter === "All" || p.category === filter);

  return (
    <section id="projects" className="py-24 bg-emerald-50/10 dark:bg-emerald-950/5 transition-colors duration-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Projects</h2>
            <div className="w-12 h-1 bg-primary rounded-full mb-6"></div>
          </div>
          
          <div className="flex flex-wrap gap-2 bg-background/60 p-1.5 rounded-full border border-border/80 w-max relative backdrop-blur-sm">
            {(["All", "Frontend", "Full Stack", "AI/ML"] as ProjectCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
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
                key={project.title}
                layout
                variants={cardVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                whileHover="hover"
                whileTap="tap"
                className="group flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden select-none cursor-pointer will-change-transform"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                      {project.category}
                    </Badge>
                    <div className="flex gap-2">
                      {project.github !== "#" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors" asChild>
                          <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Repo"><FaGithub className="h-4 w-4" /></a>
                        </Button>
                      )}
                      {project.demo !== "#" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors" asChild>
                          <a href={project.demo} aria-label="Live Demo"><ExternalLink className="h-4 w-4" /></a>
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
                    <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm flex-1 mb-6 leading-relaxed">
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
      </div>
    </section>
  );
}