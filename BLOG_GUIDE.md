# Field Notes: Medium article cards

Field Notes is a section on the portfolio homepage, immediately after Certifications. The navigation link scrolls to #blog. There is no separate blog listing or article page inside this site.

The three current cards are clearly labeled mock articles. Their Medium links are intentionally inactive until you add real article URLs.

## Replace a mock card

Edit src/data/articles.ts. Each object in the articles array represents one card:

```ts
{
  id: "my-medium-article",
  title: "My article title",
  category: "Software Development",
  description: "A short introduction to the article.",
  image: "/blog-images/my-article.jpg",
  imageAlt: "Describe what the thumbnail shows",
  mediumUrl: "https://medium.com/@your-username/your-article",
  isSample: false,
},
```

Replace the example URL with the exact address of your published Medium article. Set isSample to false. The image, title, and Read on Medium link will open it in a new tab. Add or remove objects to change the number of cards. Give each card a unique id.

## Article thumbnails

Put images in public/blog-images/. For example, public/blog-images/my-article.jpg is referenced as /blog-images/my-article.jpg in the data file. JPG, PNG, WebP, and SVG files work. Landscape images around 1400 x 900 pixels work well; the card displays a cropped 16:9 thumbnail.

## Local preview

Run npm.cmd run dev and open the localhost URL printed by Vite. Click Field Notes in the navigation, or visit http://localhost:5173/#blog if the server is on port 5173. File changes update during development. Run npm.cmd run build to create the production build.

After changing these local files, deploy the updated portfolio to make the card changes live on Netlify. The full article remains on Medium.
