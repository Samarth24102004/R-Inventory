import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Robotics Simulation & Digital Twins | RoS Inventory',
  description: 'Explore virtual test environments, Gazebo digital twins, PX4 drone SITL, and Nav2 simulation packages for ROS 2 robotics.',
  alternates: {
    canonical: 'https://rosinventory.co.in/simulation',
  },
};

export default function SimulationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

