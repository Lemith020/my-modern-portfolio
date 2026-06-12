import { motion } from "framer-motion";
import { Terminal, Code2, BrainCircuit } from "lucide-react";

export function About() {
  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
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
                Currently, I am focused on mastering <strong className="text-foreground">Artificial Intelligence, Machine Learning</strong>, and <strong className="text-foreground">Full-Stack Development</strong>. I believe that the intersection of data driven intelligence and robust, scalable web architecture is where the most impactful products are built.
              </p>
              <p>
                My ultimate career goal is to become an AI Engineer, creating intelligent products that solve real-world problems elegantly and efficiently.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                <BrainCircuit className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">AI & ML Focus</h3>
                <p className="text-sm text-muted-foreground">Passionate about predictive modeling and intelligent systems.</p>
              </div>
              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                <Code2 className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Full-Stack</h3>
                <p className="text-sm text-muted-foreground">Building end-to-end scalable web applications.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
