import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, ZoomIn } from "lucide-react";

const certs = [
  {
    title: "AWS Cloud Practitioner Essentials",
    issuer: "Amazon Web Services (AWS)",
    image: "/certificates/AWS Cloud Practitionar Essential.png",
    description: "Covered core cloud concepts, AWS services, security, architecture, pricing, and support models to build a solid foundational cloud knowledge.",
    link: "#"
  },
  {
    title: "AWS Networking Basics",
    issuer: "Amazon Web Services (AWS)",
    image: "/certificates/AWS Networking Basics.png",
    description: "Explored foundational cloud networking concepts including VPCs, subnets, routing, internet gateways, and security groups to manage cloud traffic.",
    link: "#"
  },
  {
    title: "AWS Well-Architected Foundation",
    issuer: "Amazon Web Services (AWS)",
    image: "/certificates/AWS Well Architectured Foundation.png",
    description: "Learned the six pillars of the AWS Well-Architected Framework: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability.",
    link: "#"
  },
  {
    title: "Computer Literacy",
    issuer: "Vocational & Technical Training",
    image: "/certificates/computerlitercy.png",
    description: "Comprehensive training on Microsoft Office (Word, Excel, Access, PowerPoint), along with fundamental knowledge in computer hardware assembly and basic networking.",
    link: "#"
  }
];

export function Certifications() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  return (
    <section id="certifications" className="py-24 bg-background transition-colors duration-500">
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
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ 
                scale: 1.04,
                boxShadow: "0 20px 25px -5px rgb(16 185 129 / 0.1), 0 8px 10px -6px rgb(16 185 129 / 0.1)",
                borderColor: "rgba(16, 185, 129, 0.4)"
              }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedImg(cert.image)}
              className="group flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden cursor-pointer select-none transition-colors duration-300 will-change-transform"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted border-b border-border/50">
                <img 
                  src={cert.image} 
                  alt={cert.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600/90 px-3 py-1.5 rounded-full shadow-sm">
                    <ZoomIn className="w-3.5 h-3.5" /> View Full
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-foreground text-base mb-1 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  {cert.title}
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-3">
                  {cert.issuer}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed flex-1 mb-4">
                  {cert.description}
                </p>
                
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="mt-auto pt-2 border-t border-border/40"
                >
                  <a 
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-emerald-500 transition-colors"
                  >
                    Verify Credential <ExternalLink className="ml-1 w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()} 
              className="relative max-w-4xl w-full max-h-[85vh] bg-card border border-border/50 rounded-2xl overflow-hidden shadow-2xl cursor-default"
            >
              <button
                onClick={() => setSelectedImg(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-emerald-600 transition-colors shadow-md"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full h-full flex items-center justify-center bg-muted p-2">
                <img
                  src={selectedImg}
                  alt="Certificate Maximize View"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}