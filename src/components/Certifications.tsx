import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";

const certs = [
  {
    title: "Machine Learning Specialization",
    issuer: "Coursera",
    link: "#"
  },
  {
    title: "Python for Everybody",
    issuer: "Coursera",
    link: "#"
  },
  {
    title: "Responsive Web Design",
    issuer: "freeCodeCamp",
    link: "#"
  },
  {
    title: "Intro to Git and GitHub",
    issuer: "Google",
    link: "#"
  }
];

export function Certifications() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Certifications</h2>
          <div className="w-12 h-1 bg-primary rounded-full"></div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {certs.map((cert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group flex flex-col bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground mb-1 flex-1 leading-tight">{cert.title}</h3>
              <p className="text-sm text-muted-foreground font-medium mb-4">{cert.issuer}</p>
              <a 
                href={cert.link}
                className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors mt-auto"
              >
                View Credential <ExternalLink className="ml-1.5 w-3.5 h-3.5" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
