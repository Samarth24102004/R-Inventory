export interface HardwareComponent {
  id?: string;
  component: string;
  quantity: number | string;
  description?: string;
  buy_url?: string;
  buyUrl?: string;
}

export interface Command {
  id: string;
  type: 'ubuntu' | 'ros2';
  command_text: string;
}

export interface CircuitDiagram {
  id: string;
  image_url: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  short_description?: string;
  software_description?: string;
  hardware_description?: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rosVersion: 'ROS Humble' | 'ROS Iron' | 'ROS Jazzy';
  ros_version?: string;
  thumbnail: string;
  heroImage: string;
  price: number;
  githubUrl?: string;
  github_link?: string;
  videoUrl?: string;
  video_url?: string;
  previewVideoUrl?: string;
  preview_video_url?: string;
  circuit_diagram_url?: string;
  createdAt?: string;
  created_at?: string;
  hardware?: HardwareComponent[];
  commands?: Command[];
  circuits?: CircuitDiagram[];
  preview_images?: string[];
  tags?: string[];
}

export function parseProjectDescription(desc: string = ''): { software: string; hardware: string } {
  if (!desc) return { software: '', hardware: '' };

  const softwareMatch = desc.match(/(?:\[SOFTWARE\]|SOFTWARE DESCRIPTION|SOFTWARE:)\s*([\s\S]*?)(?=(?:\[HARDWARE\]|HARDWARE DESCRIPTION|HARDWARE:)|$)/i);
  const hardwareMatch = desc.match(/(?:\[HARDWARE\]|HARDWARE DESCRIPTION|HARDWARE:)\s*([\s\S]*?)$/i);

  if (softwareMatch || hardwareMatch) {
    return {
      software: softwareMatch ? softwareMatch[1].trim() : '',
      hardware: hardwareMatch ? hardwareMatch[1].trim() : ''
    };
  }

  return {
    software: '',
    hardware: ''
  };
}

export function formatProjectDescription(software: string, hardware: string): string {
  const parts = [];
  if (software.trim()) {
    parts.push(`SOFTWARE:\n${software.trim()}`);
  }
  if (hardware.trim()) {
    parts.push(`HARDWARE:\n${hardware.trim()}`);
  }
  return parts.join('\n\n');
}

// All projects are managed in and fetched directly from Supabase
export const demoProjects: Project[] = [];

