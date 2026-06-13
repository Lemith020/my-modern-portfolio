import { motion } from "framer-motion";
import { GraduationCap, BookOpen } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "tween", ease: "easeOut", duration: 0.5 } 
  },
  hover: {
    scale: 1.02,
    backgroundColor: "rgba(16, 185, 129, 0.03)",
    borderColor: "rgba(16, 185, 129, 0.4)",
    boxShadow: "0 20px 25px -5px rgb(16 185 129 / 0.05), 0 8px 10px -6px rgb(16 185 129 / 0.05)",
    transition: { type: "spring", stiffness: 300, damping: 22 }
  },
  tap: { scale: 0.99 }
};

export function Education() {
  return (
    <section id="education" className="py-24 bg-muted/30 transition-colors duration-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-2">Education</h2>
          <div className="w-12 h-1 bg-primary rounded-full mx-auto"></div>
        </div>

        <motion.div 
          variants={cardVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          whileHover="hover"
          whileTap="tap"
          className="group bg-card border border-border/80 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden cursor-pointer select-none will-change-transform"
        >
          {/* Background Watermark Icon */}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-colors duration-300 group-hover:text-emerald-500">
            <GraduationCap className="w-64 h-64 text-foreground" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            {/* Main Icon Box */}
            <div className="flex-shrink-0 p-4 bg-primary/10 rounded-2xl text-primary group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors duration-300">
              <GraduationCap className="w-10 h-10" />
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h3 className="text-2xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  BSc (Hons) Software Engineering
                </h3>
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full w-fit group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  2025 – Present
                </span>
              </div>
              
              <h4 className="text-xl font-medium text-muted-foreground mb-6">University of Kelaniya</h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border/50 pb-2 group-hover:border-emerald-500/20 transition-colors duration-300">
                  <BookOpen className="w-5 h-5 text-primary group-hover:text-emerald-500 transition-colors duration-300" />
                  Relevant Coursework
                </div>
                
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    "Data Structures & Algorithms",
                    "Database Systems",
                    "Software Construction",
                    "Interactive Application Dev.",
                    "Software Engineering Principles",
                    "Object-Oriented Programming"
                  ].map((course, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary group-hover:bg-emerald-500 flex-shrink-0 transition-colors duration-300"></div>
                      <span className="text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300">
                        {course}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border/50 group-hover:border-emerald-500/20 transition-colors duration-300">
                <p className="text-muted-foreground text-sm italic">
                  Currently in my second year, focusing deeply on core engineering principles, system architecture, and modern programming paradigms.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}