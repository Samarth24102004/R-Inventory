export interface HardwareComponent {
  id: string;
  component: string;
  quantity: number;
  description: string;
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
  shortDescription: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rosVersion: 'ROS Humble' | 'ROS Iron' | 'ROS Jazzy';
  thumbnail: string;
  heroImage: string;
  price: number;
  githubUrl?: string;
  videoUrl?: string;
  createdAt: string;
  hardware: HardwareComponent[];
  commands: Command[];
  circuits?: CircuitDiagram[];
  preview_images?: string[];
}

export const demoProjects: Project[] = [
  {
    id: '1',
    title: 'Autonomous Warehouse Robot',
    slug: 'autonomous-warehouse-robot',
    shortDescription: 'Lidar-based SLAM and autonomous navigation for warehouse logistics.',
    description: 'A complete ROS 2 architecture for an autonomous warehouse delivery robot. Features robust SLAM mapping, dynamic obstacle avoidance via Nav2, and a centralized fleet management simulated environment.',
    category: 'Navigation2',
    difficulty: 'Advanced',
    rosVersion: 'ROS Humble',
    thumbnail: '/placeholder.jpg',
    heroImage: '/placeholder.jpg',
    price: 49.99,
    githubUrl: 'https://github.com/example/warehouse-robot',
    createdAt: new Date().toISOString(),
    hardware: [
      { id: 'h1', component: 'RPLidar A1', quantity: 1, description: '2D Laser Scanner' },
      { id: 'h2', component: 'Jetson Nano', quantity: 1, description: 'Main compute unit' },
      { id: 'h3', component: 'L298N Motor Driver', quantity: 2, description: 'Wheel motor controllers' },
    ],
    commands: [
      { id: 'c1', type: 'ubuntu', command_text: 'sudo apt install ros-humble-navigation2 ros-humble-nav2-bringup' },
      { id: 'c2', type: 'ros2', command_text: 'ros2 launch nav2_bringup tb3_simulation_launch.py' }
    ],
    circuits: [
      { id: 'cd1', image_url: '/placeholder-circuit.jpg', description: 'Main wiring diagram for L298N and Jetson Nano' }
    ]
  },
  {
    id: '2',
    title: 'ROS2 LiDAR SLAM Bot',
    slug: 'ros2-lidar-slam-bot',
    shortDescription: 'Build a 2D mapping robot using ROS 2 and SLAM Toolbox.',
    description: 'Learn the fundamentals of Simultaneous Localization and Mapping. This project provides a step-by-step implementation of slam_toolbox on a custom differential drive robot.',
    category: 'SLAM',
    difficulty: 'Intermediate',
    rosVersion: 'ROS Jazzy',
    thumbnail: '/placeholder.jpg',
    heroImage: '/placeholder.jpg',
    price: 29.99,
    createdAt: new Date().toISOString(),
    hardware: [
      { id: 'h4', component: 'Raspberry Pi 4', quantity: 1, description: 'SBC' },
      { id: 'h5', component: 'YDLiDAR X4', quantity: 1, description: '360 degree 2D Lidar' }
    ],
    commands: [
      { id: 'c3', type: 'ubuntu', command_text: 'sudo apt install ros-jazzy-slam-toolbox' },
      { id: 'c4', type: 'ros2', command_text: 'ros2 launch slam_toolbox online_async_launch.py' }
    ]
  },
  {
    id: '3',
    title: 'Computer Vision Inspection Robot',
    slug: 'computer-vision-inspection',
    shortDescription: 'YOLOv8 integrated inspection pipeline using ROS 2 image transport.',
    description: 'Deploy real-time object detection models directly into your ROS 2 graph. This project streams camera feeds, performs tensorRT optimized YOLOv8 inference, and publishes bounding box arrays.',
    category: 'Computer Vision',
    difficulty: 'Advanced',
    rosVersion: 'ROS Iron',
    thumbnail: '/placeholder.jpg',
    heroImage: '/placeholder.jpg',
    price: 39.99,
    createdAt: new Date().toISOString(),
    hardware: [
      { id: 'h6', component: 'Intel RealSense D435i', quantity: 1, description: 'Depth Camera' },
      { id: 'h7', component: 'NVIDIA Jetson Orin Nano', quantity: 1, description: 'AI Edge Compute' }
    ],
    commands: [
      { id: 'c5', type: 'ros2', command_text: 'ros2 run vision_inspection yolov8_node --ros-args -p model:=best.pt' }
    ]
  },
  {
    id: '4',
    title: 'ROS2 Drone Navigation System',
    slug: 'ros2-drone-navigation',
    shortDescription: 'PX4 SITL integrated with ROS 2 DDS for autonomous flight.',
    description: 'Take to the skies with ROS 2. Interface with PX4 autopilot via microRTPS/DDS, control offboard flight modes, and execute complex 3D waypoint missions in Gazebo.',
    category: 'Drones',
    difficulty: 'Advanced',
    rosVersion: 'ROS Humble',
    thumbnail: '/placeholder.jpg',
    heroImage: '/placeholder.jpg',
    price: 59.99,
    createdAt: new Date().toISOString(),
    hardware: [
      { id: 'h8', component: 'Pixhawk 4', quantity: 1, description: 'Flight Controller' },
      { id: 'h9', component: 'Raspberry Pi Zero 2W', quantity: 1, description: 'Companion Computer' }
    ],
    commands: [
      { id: 'c6', type: 'ros2', command_text: 'ros2 launch px4_ros_com sensor_combined_listener.launch.py' }
    ]
  },
  {
    id: '5',
    title: 'Industrial Pick And Place Arm',
    slug: 'industrial-pick-place',
    shortDescription: 'MoveIt 2 configuration for a 6-DOF industrial robotic arm.',
    description: 'Master robotic manipulation. Configure joint limits, generate MoveIt 2 packages, and execute precise pick and place operations using Cartesian path planning.',
    category: 'Manipulation',
    difficulty: 'Advanced',
    rosVersion: 'ROS Jazzy',
    thumbnail: '/placeholder.jpg',
    heroImage: '/placeholder.jpg',
    price: 79.99,
    createdAt: new Date().toISOString(),
    hardware: [
      { id: 'h10', component: 'UR5e Robot Arm', quantity: 1, description: '6-DOF Collaborative Robot' },
      { id: 'h11', component: 'Robotiq 2F-85', quantity: 1, description: 'Adaptive Gripper' }
    ],
    commands: [
      { id: 'c7', type: 'ubuntu', command_text: 'sudo apt install ros-jazzy-moveit' },
      { id: 'c8', type: 'ros2', command_text: 'ros2 launch ur_robot_driver ur_control.launch.py ur_type:=ur5e robot_ip:=192.168.1.100' }
    ]
  },
  {
    id: '6',
    title: 'AI Object Tracking Rover',
    slug: 'ai-object-tracking-rover',
    shortDescription: 'Pan-tilt tracking rover using OpenCV and ROS 2 controllers.',
    description: 'A beginner-friendly project integrating simple OpenCV color/face tracking with ros2_control to actuate a pan-tilt camera mount on a moving rover.',
    category: 'AI Robotics',
    difficulty: 'Beginner',
    rosVersion: 'ROS Humble',
    thumbnail: '/placeholder.jpg',
    heroImage: '/placeholder.jpg',
    price: 19.99,
    createdAt: new Date().toISOString(),
    hardware: [
      { id: 'h12', component: 'ESP32', quantity: 1, description: 'Microcontroller for micro-ROS' },
      { id: 'h13', component: 'SG90 Servo', quantity: 2, description: 'Pan and tilt servos' }
    ],
    commands: [
      { id: 'c9', type: 'ros2', command_text: 'ros2 run object_tracker tracker_node' }
    ]
  },
  {
    id: '7',
    title: 'Nav2 Autonomous Delivery Robot',
    slug: 'nav2-delivery-robot',
    shortDescription: 'Outdoor GPS-waypoint delivery robot using Nav2 and robot_localization.',
    description: 'Fuse RTK GPS, IMU, and Wheel Odometry to navigate outdoor environments. This project implements advanced EKF tuning and Nav2 GPS waypoint following.',
    category: 'Autonomous Vehicles',
    difficulty: 'Advanced',
    rosVersion: 'ROS Iron',
    thumbnail: '/placeholder.jpg',
    heroImage: '/placeholder.jpg',
    price: 89.99,
    createdAt: new Date().toISOString(),
    hardware: [
      { id: 'h14', component: 'ZED-F9P RTK GPS', quantity: 1, description: 'Centimeter-level accuracy GPS' },
      { id: 'h15', component: 'BNO085 IMU', quantity: 1, description: 'High precision 9-axis IMU' }
    ],
    commands: [
      { id: 'c10', type: 'ros2', command_text: 'ros2 launch robot_localization dual_ekf_navsat_example.launch.py' }
    ]
  },
  {
    id: '8',
    title: 'ROS2 Smart Agriculture Robot',
    slug: 'smart-ag-robot',
    shortDescription: 'Row-following and crop-monitoring agricultural platform.',
    description: 'Automate farming tasks. This project uses 3D point clouds to detect crop rows and dynamically adjust navigation paths without relying on global maps.',
    category: 'Industrial Robotics',
    difficulty: 'Intermediate',
    rosVersion: 'ROS Jazzy',
    thumbnail: '/placeholder.jpg',
    heroImage: '/placeholder.jpg',
    price: 59.99,
    createdAt: new Date().toISOString(),
    hardware: [
      { id: 'h16', component: 'Ouster OS1 Lidar', quantity: 1, description: '3D Lidar Sensor' },
      { id: 'h17', component: 'Intel NUC', quantity: 1, description: 'Ruggedized Compute' }
    ],
    commands: [
      { id: 'c11', type: 'ros2', command_text: 'ros2 launch ag_robot row_follower.launch.py' }
    ]
  }
];
