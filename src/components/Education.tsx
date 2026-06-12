import { motion } from "framer-motion";
import { GraduationCap, BookOpen } from "lucide-react";

export function Education() {
  return (
    <section id="education" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-2">Education</h2>
          <div className="w-12 h-1 bg-primary rounded-full mx-auto"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <GraduationCap className="w-64 h-64 text-foreground" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0 p-4 bg-primary/10 rounded-2xl text-primary">
              <GraduationCap className="w-10 h-10" />
            </div>
            
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h3 className="text-2xl font-bold text-foreground">BSc (Hons) Software Engineering</h3>
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full w-fit">2025 – Present</span>
              </div>
              
              <h4 className="text-xl font-medium text-muted-foreground mb-6">University of Kelaniya</h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border/50 pb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Relevant Coursework
                </div>
                
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                  <li className="flex items-start gap-2">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-muted-foreground">Data Structures & Algorithms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-muted-foreground">Database Systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-muted-foreground">Software Construction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-muted-foreground">Interactive Application Dev.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-muted-foreground">Software Engineering Principles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-muted-foreground">Object-Oriented Programming</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border/50">
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
