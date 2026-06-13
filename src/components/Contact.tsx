import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MapPin, Mail, Send, CheckCircle2 } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import emailjs from "@emailjs/browser";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);


    const templateParams = {
      from_name: values.name,
      reply_to: values.email,
      message: values.message,
    };


    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;


    emailjs
      .send(serviceId, templateId, templateParams, publicKey)
      .then(
        (response) => {
          console.log("SUCCESS!", response.status, response.text);
          setIsSubmitting(false);
          setIsSuccess(true);
          toast({
            title: "Success!",
            description: "Message sent successfully.",
          });
          form.reset();
        },
        (error) => {
          console.log("FAILED...", error);
          setIsSubmitting(false);
          toast({
            variant: "destructive",
            title: "Error!",
            description: "Something went wrong. Please try again later.",
          });
        }
      );
  }

  return (
    <section id="contact" className="py-24 bg-muted/30 transition-colors duration-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-2">Get In Touch</h2>
          <div className="w-12 h-1 bg-primary rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            I'm currently looking for new opportunities and collaborations. Whether you have a question, a project idea, or just want to say hi, my inbox is always open!
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-12 items-stretch">
          
          {/* Contact Details Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{
              scale: 1.02,
              backgroundColor: "rgba(16, 185, 129, 0.02)",
              borderColor: "rgba(16, 185, 129, 0.4)",
              boxShadow: "0 20px 25px -5px rgb(16 185 129 / 0.05)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="group md:col-span-2 bg-card border border-border/80 p-8 rounded-3xl shadow-sm flex flex-col justify-between cursor-pointer select-none will-change-transform"
          >
            <div>
              <h3 className="text-xl font-bold mb-6 group-hover:text-emerald-600 transition-colors duration-300">
                Contact Information
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 text-primary group-hover:bg-emerald-500/10 group-hover:text-emerald-500 rounded-xl transition-colors duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Email</p>
                    <a href="mailto:lemithnanditha41@gamil.com" className="text-foreground hover:text-emerald-500 font-medium transition-colors break-all">
                      lemithnanditha41@gamil.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 text-primary group-hover:bg-emerald-500/10 group-hover:text-emerald-500 rounded-xl transition-colors duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Location</p>
                    <p className="text-foreground font-medium group-hover:text-foreground/90 transition-colors duration-300">Kelaniya, Sri Lanka</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-border/50 group-hover:border-emerald-500/20 transition-colors duration-300">
              <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Follow Me</h4>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="rounded-full hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300" asChild>
                  <a href="https://github.com/Lemith020" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub className="w-4 h-4" /></a>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300" asChild>
                  <a href="https://www.linkedin.com/in/lemith-nanditha-b0a738381" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin className="w-4 h-4" /></a>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Form Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="md:col-span-3 bg-card border border-border p-8 md:p-10 rounded-3xl shadow-sm flex flex-col justify-center min-h-[400px]"
          >
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="contact-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Name" {...field} className="bg-background focus-visible:ring-emerald-500" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Email</FormLabel>
                              <FormControl>
                                <Input placeholder="your.email@example.com" {...field} className="bg-background focus-visible:ring-emerald-500" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell me about your project..." 
                                className="min-h-[150px] resize-none bg-background focus-visible:ring-emerald-500" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" size="lg" className="w-full sm:w-auto h-12 px-8 font-medium bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Message"}
                        {!isSubmitting && <Send className="ml-2 w-4 h-4" />}
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              ) : (
                /* Success View Box */
                <motion.div
                  key="success-box"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center justify-center text-center p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-emerald-600 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
                    Thank you for reaching out. Your message has been received perfectly, and I'll get back to you as soon as possible.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSuccess(false)}
                    className="border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}