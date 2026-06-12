import { motion } from "framer-motion";
import { Briefcase, Code, GraduationCap } from "lucide-react";

export function Experience() {
  return (
    <section id="experience" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-2">Experience</h2>
          <div className="w-12 h-1 bg-primary rounded-full mx-auto"></div>
        </div>

        <div className="relative border-l border-border/50 ml-4 md:ml-0 md:pl-0 space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative pl-8 md:pl-0"
          >
            <div className="md:grid md:grid-cols-5 md:gap-8 items-start">
              <div className="md:col-span-1 md:text-right mb-2 md:mb-0 pt-1">
                <span className="text-sm font-bold text-primary">2023 — Present</span>
              </div>
              
              <div className="absolute left-[-5px] top-1.5 md:left-1/5 md:-ml-2 w-4 h-4 rounded-full bg-background border-2 border-primary ring-4 ring-background"></div>
              
              <div className="md:col-span-4 bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all md:ml-8 relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Software Development Projects</h3>
                </div>
                <h4 className="text-base font-medium text-muted-foreground mb-4">University of Kelaniya & Independent Work</h4>
                <p className="text-muted-foreground mb-4">
                  Actively involved in building full-stack applications and machine learning models as part of university group projects and independent portfolio development. Focused on creating scalable, well-documented, and production-ready code.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">Full Stack Dev</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">Machine Learning</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">Agile Teamwork</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative pl-8 md:pl-0"
          >
            <div className="md:grid md:grid-cols-5 md:gap-8 items-start">
              <div className="md:col-span-1 md:text-right mb-2 md:mb-0 pt-1">
                <span className="text-sm font-bold text-primary">Ongoing</span>
              </div>
              
              <div className="absolute left-[-5px] top-1.5 md:left-1/5 md:-ml-2 w-4 h-4 rounded-full bg-background border-2 border-muted-foreground ring-4 ring-background"></div>
              
              <div className="md:col-span-4 bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all md:ml-8 relative opacity-80">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-secondary rounded-lg text-muted-foreground">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Freelance & Hackathons</h3>
                </div>
                <h4 className="text-base font-medium text-muted-foreground mb-4">Open to Opportunities</h4>
                <p className="text-muted-foreground">
                  Seeking opportunities to collaborate on real-world projects, contribute to open-source, and participate in hackathons to further hone my skills in AI/ML and modern web development.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
