import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  SiJavascript, SiPython, SiReact, SiVite, SiBootstrap, SiTailwindcss, 
  SiNodedotjs, SiExpress, SiMongodb, SiMysql, SiNumpy, SiPandas, SiScikitlearn, 
  SiTensorflow, SiPytorch, SiGit, SiGithub, SiPostman, SiFigma, SiPhp, SiC
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { TbBrandVscode, TbDatabase } from "react-icons/tb";
import { Code, Layout, Server, Database, BrainCircuit, PenTool, Users } from "lucide-react";

const skillCategories = [
  {
    title: "Programming Languages",
    icon: <Code className="h-5 w-5" />,
    skills: [
      { name: "Java", icon: <FaJava />, color: "hover:text-[#007396] hover:border-[#007396]/30 hover:bg-[#007396]/5" },
      { name: "C", icon: <SiC />, color: "hover:text-[#A8B9CC] hover:border-[#A8B9CC]/30 hover:bg-[#A8B9CC]/5" },
      { name: "Python", icon: <SiPython />, color: "hover:text-[#3776AB] hover:border-[#3776AB]/30 hover:bg-[#3776AB]/5" },
      { name: "JavaScript", icon: <SiJavascript />, color: "hover:text-[#F7DF1E] hover:border-[#F7DF1E]/30 hover:bg-[#F7DF1E]/5" },
      { name: "PHP", icon: <SiPhp />, color: "hover:text-[#777BB4] hover:border-[#777BB4]/30 hover:bg-[#777BB4]/5" },
      { name: "SQL", icon: <TbDatabase />, color: "hover:text-[#00758F] hover:border-[#00758F]/30 hover:bg-[#00758F]/5" },
    ]
  },
  {
    title: "Frontend",
    icon: <Layout className="h-5 w-5" />,
    skills: [
      { name: "React", icon: <SiReact /> },
      { name: "Vite", icon: <SiVite /> },
      { name: "Bootstrap", icon: <SiBootstrap /> },
      { name: "Tailwind CSS", icon: <SiTailwindcss /> },
    ]
  },
  {
    title: "Backend",
    icon: <Server className="h-5 w-5" />,
    skills: [
      { name: "Node.js", icon: <SiNodedotjs /> },
      { name: "Express.js", icon: <SiExpress /> },
      { name: "REST APIs", icon: <Server /> },
      { name: "JWT Auth", icon: <Code /> },
    ]
  },
  {
    title: "Database",
    icon: <Database className="h-5 w-5" />,
    skills: [
      { name: "MongoDB", icon: <SiMongodb /> },
      { name: "MySQL", icon: <SiMysql /> },
    ]
  },
  {
    title: "AI/ML",
    icon: <BrainCircuit className="h-5 w-5" />,
    skills: [
      { name: "Python", icon: <SiPython /> },
      { name: "NumPy", icon: <SiNumpy /> },
      { name: "Pandas", icon: <SiPandas /> },
      { name: "Scikit-Learn", icon: <SiScikitlearn /> },
      { name: "TensorFlow", icon: <SiTensorflow /> },
      { name: "PyTorch", icon: <SiPytorch /> },
      { name: "Data Viz", icon: <BrainCircuit /> },
    ]
  },
  {
    title: "Tools",
    icon: <PenTool className="h-5 w-5" />,
    skills: [
      { name: "Git", icon: <SiGit /> },
      { name: "GitHub", icon: <SiGithub /> },
      { name: "Postman", icon: <SiPostman /> },
      { name: "VS Code", icon: <TbBrandVscode /> },
      { name: "IntelliJ", icon: <Code /> },
      { name: "Figma", icon: <SiFigma /> },
    ]
  },
  {
    title: "Soft Skills",
    icon: <Users className="h-5 w-5" />,
    skills: [
      { name: "Teamwork", icon: null },
      { name: "Problem Solving", icon: null },
      { name: "Communication", icon: null },
      { name: "Leadership", icon: null },
    ]
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
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  hover: {
    scale: 1.03,
    backgroundColor: "rgba(16, 185, 129, 0.04)",
    borderColor: "rgba(16, 185, 129, 0.4)",
    boxShadow: "0 15px 30px -10px rgb(16 185 129 / 0.08)",
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  tap: { scale: 0.99 }
};

const badgeVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

export function Skills() {
  return (
    <section id="skills" className="py-24 bg-emerald-50/10 dark:bg-emerald-950/5 transition-colors duration-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Skills & Technologies</h2>
          <div className="w-12 h-1 bg-primary rounded-full"></div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {skillCategories.map((category, i) => (
            <motion.div 
              key={i} 
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm cursor-pointer select-none transition-colors duration-300 group will-change-transform"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors duration-300">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-lg transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {category.title}
                </h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, j) => (
                  <motion.div
                    key={j}
                    variants={badgeVariants}
                    initial="initial"
                    whileHover="hover"
                  >
                    <Badge 
                      variant="secondary" 
                      className={`flex items-center gap-1.5 py-1.5 px-3 bg-secondary/40 border border-transparent transition-all duration-300 ${
                        skill.color ? skill.color : "hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                      }`}
                    >
                      {skill.icon && (
                        <span className="text-muted-foreground transition-colors duration-300 group-hover:text-inherit">
                          {skill.icon}
                        </span>
                      )}
                      {skill.name}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}