export type ArticleFields = {
  title: string;
  category: string;
  description: string;
  mediumUrl: string;
  coverKey: string;
};

export type StudioArticle = ArticleFields & {
  id: string;
  revision: string;
  status: "draft" | "published";
  updatedAt: string;
  image: string;
  isSample?: boolean;
};

export const STUDIO_ENDPOINT = "/.netlify/functions/article-studio";
export const MAX_COVER_BYTES = 3 * 1024 * 1024;
