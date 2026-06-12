import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";

type ProjectCategory = "All" | "Full Stack" | "AI/ML";

const projects = [
  {
    title: "Task Management System",
    description: "A comprehensive full-stack task management solution with user authentication, real-time updates, and team collaboration features.",
    category: "Full Stack",
    tech: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
    github: "#",
    demo: "#"
  },
  {
    title: "E-commerce Platform",
    description: "A robust e-commerce system featuring product catalog, shopping cart, payment integration, and an admin dashboard for inventory management.",
    category: "Full Stack",
    tech: ["React", "C#", ".NET Core", "SQL Server", "Stripe"],
    github: "#",
    demo: "#"
  },
  {
    title: "Student Management System",
    description: "A university-level student portal to manage enrollments, grades, course tracking, and faculty interactions.",
    category: "Full Stack",
    tech: ["Java", "Spring Boot", "MySQL", "React"],
    github: "#",
    demo: "#"
  },
  {
    title: "House Price Prediction",
    description: "An ML model that predicts housing prices based on location, amenities, and structural features using regression algorithms.",
    category: "AI/ML",
    tech: ["Python", "Scikit-Learn", "Pandas", "Matplotlib"],
    github: "#",
    demo: "#"
  },
  {
    title: "Disease Prediction System",
    description: "A diagnostic tool utilizing machine learning classifiers to predict potential diseases based on patient symptom inputs.",
    category: "AI/ML",
    tech: ["Python", "TensorFlow", "Scikit-Learn", "Flask"],
    github: "#",
    demo: "#"
  },
  {
    title: "Image Classification Engine",
    description: "A deep learning application utilizing Convolutional Neural Networks (CNN) to categorize real-world images into predefined classes.",
    category: "AI/ML",
    tech: ["PyTorch", "Python", "OpenCV"],
    github: "#",
    demo: "#"
  },
  {
    title: "Intelligent Chatbot",
    description: "An NLP-powered conversational agent capable of understanding user intents and providing contextual, intelligent responses.",
    category: "AI/ML",
    tech: ["Python", "NLTK", "TensorFlow"],
    github: "#",
    demo: "#"
  },
  {
    title: "Product Recommendation System",
    description: "A collaborative filtering engine that recommends products to users based on historical interaction and purchase patterns.",
    category: "AI/ML",
    tech: ["Python", "Pandas", "Scikit-Learn"],
    github: "#",
    demo: "#"
  }
];

export function Projects() {
  const [filter, setFilter] = useState<ProjectCategory>("All");

  const filteredProjects = projects.filter(p => filter === "All" || p.category === filter);

  return (
    <section id="projects" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Projects</h2>
            <div className="w-12 h-1 bg-primary rounded-full mb-6"></div>
          </div>
          
          <div className="flex flex-wrap gap-2 bg-background/50 p-1.5 rounded-full border border-border/50 w-max">
            {(["All", "Full Stack", "AI/ML"] as ProjectCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === cat 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-primary/30"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">{project.category}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
                        <a href={project.github} aria-label="GitHub Repo"><FaGithub className="h-4 w-4" /></a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
                        <a href={project.demo} aria-label="Live Demo"><ExternalLink className="h-4 w-4" /></a>
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-muted-foreground text-sm flex-1 mb-6">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border/50">
                    {project.tech.map(t => (
                      <span key={t} className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                        {t}
                      </span>
                    ))}
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