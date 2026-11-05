import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";
import {
  SiJavascript, SiPython, SiReact, SiVite, SiBootstrap, SiTailwindcss,
  SiNodedotjs, SiExpress, SiMongodb, SiMysql, SiNumpy, SiPandas,
  SiScikitlearn, SiTensorflow, SiPytorch, SiGit, SiGithub, SiPostman,
  SiFigma, SiPhp, SiC, SiJsonwebtokens, SiIntellijidea,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { TbBrandVscode, TbDatabase } from "react-icons/tb";
import {
  Code2, PanelsTopLeft, Server, Database, BrainCircuit, Wrench,
  Users, ChartNoAxesCombined, Puzzle, MessageCircle, Compass,
} from "lucide-react";

type Skill = {
  name: string;
  Icon: IconType | LucideIcon;
  color: string;
  iconSurface?: string;
};

type SkillCategory = {
  title: string;
  Icon: LucideIcon;
  accent: string;
  skills: Skill[];
};

export const skillCategories: SkillCategory[] = [
  {
    title: "Programming Languages", Icon: Code2, accent: "#4f7ee8",
    skills: [
      { name: "Java", Icon: FaJava, color: "#e76f00" },
      { name: "C", Icon: SiC, color: "#5c78b9" },
      { name: "Python", Icon: SiPython, color: "#3776ab" },
      { name: "JavaScript", Icon: SiJavascript, color: "#f7df1e", iconSurface: "#292d35" },
      { name: "PHP", Icon: SiPhp, color: "#777bb4" },
      { name: "SQL", Icon: TbDatabase, color: "#00758f" },
    ],
  },
  {
    title: "Frontend", Icon: PanelsTopLeft, accent: "#0891b2",
    skills: [
      { name: "React", Icon: SiReact, color: "#61dafb", iconSurface: "#173346" },
      { name: "Vite", Icon: SiVite, color: "#9464f5" },
      { name: "Bootstrap", Icon: SiBootstrap, color: "#7952b3" },
      { name: "Tailwind CSS", Icon: SiTailwindcss, color: "#06b6d4", iconSurface: "#123440" },
    ],
  },
  {
    title: "Backend", Icon: Server, accent: "#16a36a",
    skills: [
      { name: "Node.js", Icon: SiNodedotjs, color: "#43853d" },
      { name: "Express.js", Icon: SiExpress, color: "#475569" },
      { name: "REST APIs", Icon: Server, color: "#0f9b8e" },
      { name: "JWT Auth", Icon: SiJsonwebtokens, color: "#c34c94" },
    ],
  },
  {
    title: "Database", Icon: Database, accent: "#d18a24",
    skills: [
      { name: "MongoDB", Icon: SiMongodb, color: "#47a248" },
      { name: "MySQL", Icon: SiMysql, color: "#4479a1" },
    ],
  },
  {
    title: "AI/ML", Icon: BrainCircuit, accent: "#9360d6",
    skills: [
      { name: "Python", Icon: SiPython, color: "#3776ab" },
      { name: "NumPy", Icon: SiNumpy, color: "#4d77cf" },
      { name: "Pandas", Icon: SiPandas, color: "#150458" },
      { name: "Scikit-Learn", Icon: SiScikitlearn, color: "#e98932" },
      { name: "TensorFlow", Icon: SiTensorflow, color: "#ff6f00" },
      { name: "PyTorch", Icon: SiPytorch, color: "#ee4c2c" },
      { name: "Data Viz", Icon: ChartNoAxesCombined, color: "#8b5cf6" },
    ],
  },
  {
    title: "Tools", Icon: Wrench, accent: "#df6b43",
    skills: [
      { name: "Git", Icon: SiGit, color: "#f05032" },
      { name: "GitHub", Icon: SiGithub, color: "#24292f" },
      { name: "Postman", Icon: SiPostman, color: "#ff6c37" },
      { name: "VS Code", Icon: TbBrandVscode, color: "#007acc" },
      { name: "IntelliJ", Icon: SiIntellijidea, color: "#b846b5" },
      { name: "Figma", Icon: SiFigma, color: "#f24e1e" },
    ],
  },
  {
    title: "Soft Skills", Icon: Users, accent: "#c25a91",
    skills: [
      { name: "Teamwork", Icon: Users, color: "#b05289" },
      { name: "Problem Solving", Icon: Puzzle, color: "#9463ce" },
      { name: "Communication", Icon: MessageCircle, color: "#278d9b" },
      { name: "Leadership", Icon: Compass, color: "#cc8641" },
    ],
  },
];
