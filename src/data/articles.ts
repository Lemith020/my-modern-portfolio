export type MediumArticle = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
  mediumUrl: string;
  isSample?: boolean;
};

// Replace these samples with your own Medium articles.
// Put thumbnails in public/blog-images/ and reference /blog-images/filename.jpg.
// Set a real mediumUrl and isSample: false to enable the article link.
export const articles: MediumArticle[] = [
  {
    id: "idea-to-app",
    title: "From an Idea to a Working App",
    category: "Full-Stack Development",
    description: "Breaking a big idea into small, practical steps: planning the essentials, building a first version, and improving it one feature at a time.",
    image: "/blog-images/build-cycle.svg",
    imageAlt: "An illustrated workflow showing explore, build, and reflect",
    mediumUrl: "",
    isSample: true,
  },
  {
    id: "machine-learning-notes",
    title: "A First Step into Machine Learning",
    category: "Artificial Intelligence & ML",
    description: "A beginner-friendly look at data, models, and predictions, with simple ideas for turning curiosity about machine learning into a first experiment.",
    image: "/blog-images/machine-learning.svg",
    imageAlt: "A diagram connecting input data to a model and its prediction",
    mediumUrl: "",
    isSample: true,
  },
  {
    id: "better-code",
    title: "Small Habits, Better Code",
    category: "Learning & Developer Life",
    description: "Readable names, smaller functions, and useful notes: a few thoughtful habits that make everyday development easier to understand and maintain.",
    image: "/blog-images/notebook-cover.svg",
    imageAlt: "An illustrated notebook with a small code window",
    mediumUrl: "",
    isSample: true,
  },
];
