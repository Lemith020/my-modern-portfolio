import { motion } from "framer-motion";
import { ExternalLink, ZoomIn } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CertificateStudio } from "@/components/CertificateStudio";
import { studioRequest } from "@/lib/article-studio-api";
import type { PublicCertificate } from "@/lib/certificate-studio-types";

export function Certifications() {
  const queryClient = useQueryClient();
  const listing = useQuery({ queryKey: ["certifications"], queryFn: () => studioRequest<{ certificates: PublicCertificate[] }>("certificates-public"), staleTime: 0, retry: 1 });
  const certificates = listing.data?.certificates ?? [];
  return <section id="certifications" className="py-24 bg-background transition-colors duration-500" aria-labelledby="certifications-heading">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
      <div className="mb-12"><h2 id="certifications-heading" className="text-3xl font-bold mb-2">Certifications</h2><div className="w-12 h-1 bg-primary rounded-full" /></div>
      {listing.isPending && <p role="status" className="mb-6 text-sm text-muted-foreground">Loading certificates...</p>}
      {listing.isError && <div role="alert" className="mb-6 flex flex-wrap items-center gap-3"><p>Certificates could not be refreshed.</p><Button variant="outline" onClick={() => { void listing.refetch(); }}>Retry</Button></div>}
      {listing.isSuccess && !certificates.length && <p className="py-8 text-muted-foreground">No published certificates yet.</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {certificates.map((certificate, index) => <CertificateCard key={certificate.id} certificate={certificate} index={index} />)}
      </div>
      <CertificateStudio onChanged={() => { void queryClient.invalidateQueries({ queryKey: ["certifications"] }); }} />
    </div>
  </section>;
}

function CertificateCard({ certificate: cert, index }: { certificate: PublicCertificate; index: number }) {
  return <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: Math.min(index * 0.08, 0.24), duration: 0.4 }} whileHover={{ scale: 1.02, borderColor: "rgba(16, 185, 129, 0.4)" }} className="group min-w-0 flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden transition-colors duration-300">
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" aria-label={`View ${cert.title} certificate`} className="relative aspect-[4/3] w-full overflow-hidden bg-muted border-b border-border/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
          <img src={cert.image} alt={cert.title} loading="lazy" className="h-full w-full object-contain p-2" />
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-1 text-xs font-medium text-white"><ZoomIn className="h-3 w-3" aria-hidden="true" />View full</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%_-_2rem)] max-w-5xl max-h-[95dvh] overflow-y-auto rounded-2xl">
        <DialogHeader className="pr-6"><DialogTitle>{cert.title}</DialogTitle><DialogDescription>{cert.issuer}</DialogDescription></DialogHeader>
        <img src={cert.image} alt={`${cert.title} full certificate`} className="mx-auto max-h-[75dvh] w-full object-contain" />
      </DialogContent>
    </Dialog>
    <div className="p-5 flex-1 flex flex-col">
      <h3 className="font-bold text-foreground text-base mb-1 leading-snug break-words group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{cert.title}</h3>
      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-3 break-words">{cert.issuer}</p>
      {cert.issueDate && <time dateTime={cert.issueDate} className="mb-3 text-xs text-muted-foreground">Issued {cert.issueDate}</time>}
      <p className="text-muted-foreground text-xs leading-relaxed flex-1 mb-4 break-words">{cert.description}</p>
      {cert.link && <div className="mt-auto pt-2 border-t border-border/40"><a href={cert.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-emerald-500 rounded focus-visible:outline-2 focus-visible:outline-primary">Verify Credential <ExternalLink className="ml-1 w-3 h-3" aria-hidden="true" /></a></div>}
    </div>
  </motion.div>;
}
