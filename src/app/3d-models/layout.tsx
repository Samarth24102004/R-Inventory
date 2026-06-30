import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '3D Print Models | RoS Inventory',
  description: 'Download high-quality, print-ready STL files and 3D models for your robotics projects. Build custom robot chassis, sensor mounts, and components with RoS Inventory.',
  alternates: {
    canonical: 'https://rosinventory.co.in/3d-models',
  },
};

export default function ThreeDModelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
