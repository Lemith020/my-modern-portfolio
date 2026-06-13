import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import profileImg from "../images/profile.png";

const avatarPlaceholder = profileImg;

const liquidTransition = {
  type: "spring",
  stiffness: 400,
  damping: 10,
  mass: 0.8
};

export function Hero() {
  return (
    <section id="home" className="min-h-[100dvh] pt-20 flex items-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.02]" 
           style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-mono font-medium mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Available for opportunities
              </motion.div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-4">
                Hi, I'm <span className="text-primary">Lemith.</span>
              </h1>
              <h2 className="text-xl sm:text-2xl font-medium text-muted-foreground mb-6">
                BSc (Hons) Software Engineering Undergraduate <br className="hidden sm:block" />
                at <span className="text-foreground">University of Kelaniya</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground/80 max-w-xl">
                Aspiring AI/ML Engineer & Full-Stack Developer. I build intelligent products and scalable web applications that solve real-world problems.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={liquidTransition}
              >
                <Button size="lg" className="h-12 px-8 font-medium group" onClick={() => {
                  const element = document.querySelector("#contact");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}>
                  Contact Me
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={liquidTransition}
              >
                <Button size="lg" variant="outline" className="h-12 px-8 font-medium">
                  <Download className="mr-2 h-4 w-4" />
                  Download CV
                </Button>
              </motion.div>
            </div>

            {/* Icons ලොකු කර ඇත (h-12 w-12 සහ Icon එක h-6 w-6) */}
            <div className="flex items-center gap-4 pt-4">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 12 }}
                whileTap={{ scale: 0.9, rotate: -8 }}
                transition={liquidTransition}
              >
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-border bg-card/50 hover:bg-primary/10 hover:text-primary transition-colors shadow-sm" asChild>
                  <a href="https://github.com/Lemith020" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <FaGithub className="h-6 w-6" />
                  </a>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.2, rotate: -12 }}
                whileTap={{ scale: 0.9, rotate: 8 }}
                transition={liquidTransition}
              >
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-border bg-card/50 hover:bg-primary/10 hover:text-primary transition-colors shadow-sm" asChild>
                  <a href="https://www.linkedin.com/in/lemith-nanditha-b0a738381" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <FaLinkedin className="h-6 w-6" />
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <motion.div 
              className="relative w-72 h-72 sm:w-96 sm:h-96 cursor-pointer"
              whileHover={{ 
                scale: 1.03,
                borderRadius: ["24px", "40px", "24px"],
              }}
              transition={{ 
                duration: 0.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <img 
                src={avatarPlaceholder} 
                alt="Lemith - Avatar" 
                className="relative z-10 w-full h-full object-cover rounded-3xl shadow-2xl ring-1 ring-border/50 bg-card transition-all duration-500 hover:rounded-[2rem]"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}