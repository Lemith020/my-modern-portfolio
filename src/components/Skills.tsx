import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { skillCategories } from "@/data/skills";
import "@/styles/skills.css";

export function Skills() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="skills" className="py-24 bg-emerald-50/10 dark:bg-emerald-950/5 transition-colors duration-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Skills &amp; Technologies</h2>
          <div className="w-12 h-1 bg-primary rounded-full" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, index) => (
            <motion.article
              key={category.title}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.2) }}
              className="skill-category"
              style={{ "--skill-accent": category.accent } as CSSProperties}
              aria-labelledby={`skill-category-${index}`}
            >
              <div className="skill-category-header">
                <span className="skill-category-icon" aria-hidden="true"><category.Icon /></span>
                <h3 id={`skill-category-${index}`}>{category.title}</h3>
              </div>
              <ul className="skill-category-list">
                {category.skills.map(skill => (
                  <li
                    key={skill.name}
                    className="skill-tag"
                    style={{ "--brand": skill.color, "--icon-surface": skill.iconSurface } as CSSProperties}
                  >
                    <span className="skill-tag-icon" aria-hidden="true"><skill.Icon /></span>
                    <span className="skill-tag-label">{skill.name}</span>
                  </li>
                ))}
              </ul>
              <p className="skill-category-footer">
                {String(category.skills.length).padStart(2, "0")} {category.title === "Soft Skills" ? "strengths" : "skills & tools"}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
