import { motion } from "framer-motion";
import { Code2, BrainCircuit } from "lucide-react";

const smoothTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
};

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  initial: {
    opacity: 0,
    y: 15,
    backgroundColor: "rgba(255, 255, 255, 0)",
    borderColor: "currentColor"
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
  hover: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.4)",
    boxShadow: "0 10px 15px -3px rgb(16 185 129 / 0.05)"
  },
  tap: { scale: 0.99 }
};

const contentHoverVariants = {
  hover: { x: 4, transition: { duration: 0.2, ease: "easeOut" } }
};

export function About() {
  return (
    <section id="about" className="py-24 bg-emerald-50/30 dark:bg-emerald-950/10 transition-colors duration-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-2">About Me</h2>
          <div className="w-12 h-1 bg-primary mb-8 rounded-full"></div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6 text-lg text-muted-foreground">
              <p>
                I am a second-year Software Engineering undergraduate at the University of Kelaniya, Sri Lanka. My journey in tech is driven by an insatiable curiosity for how intelligent systems can transform our daily lives.
              </p>
              <p>
                Currently, I am focused on mastering <strong className="text-foreground">Artificial Intelligence, Machine Learning</strong>, and <strong className="text-foreground">Full Stack Development</strong>. I believe that the intersection of data-driven intelligence and robust, scalable web architecture is where the most impactful products are built.
              </p>
              <p>
                My ultimate career goal is to become an AI Engineer, creating intelligent products that solve real world problems elegantly and efficiently.
              </p>
            </div>
            
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div 
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                transition={smoothTransition}
                className="p-5 rounded-2xl bg-card border border-border/80 cursor-pointer select-none group"
              >
                <motion.div variants={contentHoverVariants} className="space-y-3">
                  <BrainCircuit className="h-8 w-8 text-primary group-hover:text-emerald-500 transition-colors duration-300" />
                  <h3 className="font-semibold text-foreground">AI & ML Focus</h3>
                  <p className="text-sm text-muted-foreground">Passionate about predictive modeling and intelligent systems.</p>
                </motion.div>
              </motion.div>

              <motion.div 
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                transition={smoothTransition}
                className="p-5 rounded-2xl bg-card border border-border/80 cursor-pointer select-none group"
              >
                <motion.div variants={contentHoverVariants} className="space-y-3">
                  <Code2 className="h-8 w-8 text-primary group-hover:text-emerald-500 transition-colors duration-300" />
                  <h3 className="font-semibold text-foreground">Full-Stack</h3>
                  <p className="text-sm text-muted-foreground">Building end-to-end scalable web applications.</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}