import type { PublicProject } from "../lib/project-studio-types.ts";

export const initialProjects: PublicProject[] = [
  {
    id: "task-management-system",
    title: "Task Management System",
    description: "A MERN stack task management system built to organize, track, and manage daily development tasks efficiently.",
    category: "Full Stack",
    tech: ["MongoDB", "Express.js", "React", "Node.js", "HTML", "CSS"],
    github: "https://github.com/Lemith020/Manage-Task-List",
    demo: ""
  },
  {
    id: "simple-full-stack-login-page",
    title: "Simple Full-Stack Login Page",
    description: "A secure full-stack login and authentication interface utilizing PHP for server-side logic and MySQL databases managed via XAMPP.",
    category: "Full Stack",
    tech: ["PHP", "MySQL", "JavaScript", "HTML", "CSS"],
    github: "https://github.com/Lemith020/simple-fullstack-login-page",
    demo: ""
  },
  {
    id: "amazon-ui-clone",
    title: "Amazon UI Clone",
    description: "A pixel-perfect frontend replica of the Amazon e-commerce platform homepage to practice responsive web design and layouts.",
    category: "Frontend",
    tech: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/Lemith020/Amazon-clone.git",
    demo: ""
  },
  {
    id: "classic-snake-game",
    title: "Classic Snake Game",
    description: "A retro browser-based interactive grid game built logic-first using vanilla JavaScript and styled with clean CSS.",
    category: "Frontend",
    tech: ["JavaScript", "HTML", "CSS"],
    github: "https://github.com/Lemith020/snake-game.git",
    demo: ""
  },
  {
    id: "weather-application",
    title: "Weather Application",
    description: "A real-time weather tracking application fetching current atmospheric updates and presenting them through a modern frontend dynamic UI.",
    category: "Frontend",
    tech: ["JavaScript", "HTML", "CSS"],
    github: "https://github.com/Lemith020/weater-app",
    demo: ""
  },
  {
    id: "react-stopwatch",
    title: "React Stopwatch",
    description: "A precision stopwatch component built during a comprehensive core React course to master hooks, rendering cycles, and state management.",
    category: "Frontend",
    tech: ["React", "JavaScript", "HTML", "CSS"],
    github: "https://github.com/Lemith020/React-Course",
    demo: ""
  },
  {
    id: "ai-ml-research",
    title: "AI/ML Research & Engineering Projects",
    description: "Intelligent systems, predictive models, and pipeline implementations currently conceptualized and pending for active development.",
    category: "AI/ML",
    tech: ["Python"],
    github: "",
    demo: "",
    isPending: true
  }
];
