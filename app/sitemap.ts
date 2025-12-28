import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://eweekend.juecell.com";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pitchgenix`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/technokraft`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/corpdevs`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/databinge`,
      lastModified: new Date(),
      priority: 0.7,
    },
  ];
}