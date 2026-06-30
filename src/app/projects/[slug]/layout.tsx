import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const { data: project } = await supabase
    .from('projects')
    .select('title, description, cover_url')
    .eq('slug', slug)
    .single();

  if (!project) {
    return {
      title: 'Project Not Found | RoS Inventory',
    };
  }

  return {
    title: `${project.title} | RoS Inventory`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [
        {
          url: project.cover_url,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [project.cover_url],
    },
    alternates: {
      canonical: `https://rosinventory.co.in/projects/${slug}`,
    },
  };
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
