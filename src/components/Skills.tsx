import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  SiJavascript, SiPython, SiReact, SiVite, SiBootstrap, SiTailwindcss, 
  SiNodedotjs, SiExpress, SiMongodb, SiMysql, SiNumpy, SiPandas, SiScikitlearn, 
  SiTensorflow, SiPytorch, SiGit, SiGithub, SiPostman, SiFigma
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { TbBrandVscode, TbDatabase } from "react-icons/tb";
import { Code, Layout, Server, Database, BrainCircuit, PenTool, Users } from "lucide-react";

const skillCategories = [
  {
    title: "Programming Languages",
    icon: <Code className="h-5 w-5" />,
    skills: [
      { name: "Java", icon: <FaJava /> },
      { name: "JavaScript", icon: <SiJavascript /> },
      { name: "Python", icon: <SiPython /> },
      { name: "C#", icon: <Code /> },
      { name: "SQL", icon: <TbDatabase /> },
    ]
  },
  {
    title: "Frontend",
    icon: <Layout className="h-5 w-5" />,
    skills: [
      { name: "HTML/CSS", icon: <Code /> },
      { name: "JavaScript", icon: <SiJavascript /> },
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
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function Skills() {
  return (
    <section id="skills" className="py-24">
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
              variants={itemVariants}
              className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-lg">{category.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, j) => (
                  <Badge 
                    key={j} 
                    variant="secondary" 
                    className="flex items-center gap-1.5 py-1.5 px-3 bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    {skill.icon && <span className="text-muted-foreground">{skill.icon}</span>}
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
