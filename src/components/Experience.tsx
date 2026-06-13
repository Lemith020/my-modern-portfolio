import { motion } from "framer-motion";
import { Briefcase, Code } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0, 
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

export function Experience() {
  return (
    <section id="experience" className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-2">Experience</h2>
          <div className="w-12 h-1 bg-primary rounded-full mx-auto"></div>
        </div>

        <div className="relative border-l border-border/50 ml-4 md:ml-0 md:pl-0 space-y-12">
          
          {/* Card 1: Software Development Projects */}
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="relative pl-8 md:pl-0 group"
          >
            <div className="md:grid md:grid-cols-5 md:gap-8 items-start">
              <div className="md:col-span-1 md:text-right mb-2 md:mb-0 pt-1">
                <span className="text-sm font-bold text-primary group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  2023 — Present
                </span>
              </div>
              
              {/* Timeline Dot */}
              <div className="absolute left-[-5px] top-1.5 md:left-1/5 md:-ml-2 w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:border-emerald-500 ring-4 ring-background transition-colors duration-300"></div>
              
              <motion.div 
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                className="md:col-span-4 bg-card border border-border/80 p-6 rounded-2xl shadow-sm cursor-pointer select-none md:ml-8 relative will-change-transform"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors duration-300">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    Software Development Projects
                  </h3>
                </div>
                <h4 className="text-base font-medium text-muted-foreground mb-4">University of Kelaniya & Independent Work</h4>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Actively involved in building full-stack applications and machine learning models as part of university group projects and independent portfolio development. Focused on creating scalable, well-documented, and production-ready code.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium border border-transparent group-hover:border-emerald-500/20 group-hover:bg-emerald-500/5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-300">Full Stack Dev</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium border border-transparent group-hover:border-emerald-500/20 group-hover:bg-emerald-500/5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-300">Machine Learning</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium border border-transparent group-hover:border-emerald-500/20 group-hover:bg-emerald-500/5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-300">Agile Teamwork</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Card 2: Freelance & Hackathons */}
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="relative pl-8 md:pl-0 group"
          >
            <div className="md:grid md:grid-cols-5 md:gap-8 items-start">
              <div className="md:col-span-1 md:text-right mb-2 md:mb-0 pt-1">
                <span className="text-sm font-bold text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  Ongoing
                </span>
              </div>
              
              {/* Timeline Dot */}
              <div className="absolute left-[-5px] top-1.5 md:left-1/5 md:-ml-2 w-4 h-4 rounded-full bg-background border-2 border-muted-foreground group-hover:border-emerald-500 ring-4 ring-background transition-colors duration-300"></div>
              
              <motion.div 
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                className="md:col-span-4 bg-card border border-border/80 p-6 rounded-2xl shadow-sm cursor-pointer select-none md:ml-8 relative will-change-transform"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-secondary rounded-lg text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors duration-300">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    Freelance & Hackathons
                  </h3>
                </div>
                <h4 className="text-base font-medium text-muted-foreground mb-4">Open to Opportunities</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Seeking opportunities to collaborate on real-world projects, contribute to open-source, and participate in hackathons to further hone my skills in AI/ML and modern web development.
                </p>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}