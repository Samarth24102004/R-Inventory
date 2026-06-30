import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rosinventory.co.in';

  // Fetch dynamic projects to include in the sitemap
  const { data: projects } = await supabase
    .from('projects')
    .select('slug, created_at');

  const projectUrls = projects?.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(project.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/3d-models`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...projectUrls,
  ];
}
