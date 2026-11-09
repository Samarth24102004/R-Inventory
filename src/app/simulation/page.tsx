"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { 
  Cpu, 
  Terminal, 
  Layers, 
  Copy, 
  Check, 
  ExternalLink, 
  Play, 
  Box, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';

interface SimulationModule {
  id: string;
  title: string;
  category: 'Gazebo & Gz Sim' | 'Nav2 & SLAM' | 'Robotic Arms' | 'PX4 Drones';
  tag: string;
  description: string;
  longDescription: string;
  projectSlug?: string;
  rosDistro: 'ROS 2 Humble' | 'ROS 2 Iron' | 'ROS 2 Jazzy';
  simulator: 'Gazebo Fortress' | 'Gazebo Classic 11' | 'Ignition Gazebo' | 'PX4 SITL' | 'RViz2';
  launchCommand: string;
  sensors: string[];
  features: string[];
  previewGradient: string;
}

const simulationModules: SimulationModule[] = [
  {
    id: 'sim-warehouse',
    title: 'Autonomous Warehouse Logistics Sim',
    category: 'Nav2 & SLAM',
    tag: 'Nav2 • Gazebo',
    description: 'Dynamic warehouse world with shelving racks, charging docks, and autonomous TurtleBot/diff-drive delivery agents.',
    longDescription: 'Simulates a multi-bay industrial distribution center. Includes laser scan obstacle avoidance, Nav2 Costmap 2D dynamic inflation layer, global Smac planner, and DWB local controller.',
    projectSlug: 'autonomous-warehouse-robot',
    rosDistro: 'ROS 2 Humble',
    simulator: 'Gazebo Fortress',
    launchCommand: 'ros2 launch nav2_bringup tb3_simulation_launch.py headless:=False',
    sensors: ['2D RPLidar', 'Wheel Odometry', 'IMU 9-DOF', 'Laser Costmap'],
    features: ['Dynamic Path Planning', 'Multi-Goal Waypoint Navigation', 'Docking Routine'],
    previewGradient: 'from-blue-600/20 via-cyan-500/15 to-transparent',
  },
  {
    id: 'sim-drone-px4',
    title: 'PX4 SITL Drone Waypoint Flight',
    category: 'PX4 Drones',
    tag: 'microRTPS • PX4',
    description: 'High-fidelity multi-rotor flight simulation integrated with PX4 Autopilot SITL and ROS 2 DDS offboard bridge.',
    longDescription: 'Simulates quadcopter aerodynamic physics in Gazebo. Communicates via micro-XRCE-DDS agent to publish offboard position/attitude setpoints, battery telemetry, and GPS lock.',
    projectSlug: 'ros2-drone-navigation',
    rosDistro: 'ROS 2 Humble',
    simulator: 'PX4 SITL',
    launchCommand: 'MicroXRCEAgent udp4 -p 8888 & ros2 launch px4_ros_com sensor_combined_listener.launch.py',
    sensors: ['GPS RTK Receiver', 'Barometer', 'Optical Flow', '3-Axis Gyro'],
    features: ['Autonomous 3D Waypoints', 'Fail-safe Return-to-Launch', 'Offboard DDS Bridge'],
    previewGradient: 'from-indigo-600/20 via-purple-500/15 to-transparent',
  },
  {
    id: 'sim-slam-toolbox',
    title: '2D LiDAR SLAM & Mapping Sim',
    category: 'Nav2 & SLAM',
    tag: 'SLAM Toolbox',
    description: 'Real-time asynchronous 2D mapping in unmapped indoor environments with loop-closure optimization.',
    longDescription: 'Uses slam_toolbox online_async node with differential-drive kinematics to generate occupancy grids. Ideal for testing custom mapping parameters and sensor noise filters.',
    projectSlug: 'ros2-lidar-slam-bot',
    rosDistro: 'ROS 2 Jazzy',
    simulator: 'Gazebo Fortress',
    launchCommand: 'ros2 launch slam_toolbox online_async_launch.py use_sim_time:=True',
    sensors: ['360° LiDAR Scan', 'Diff-Drive Encoders', 'TF Transform Tree'],
    features: ['Pose Graph Optimization', 'Loop Closure Detection', 'Map Serialization (.yaml/.pgm)'],
    previewGradient: 'from-emerald-600/20 via-teal-500/15 to-transparent',
  },
  {
    id: 'sim-moveit-arm',
    title: '6-DOF Robotic Arm Trajectory Sim',
    category: 'Robotic Arms',
    tag: 'MoveIt 2 • RViz',
    description: 'Kinematic trajectory generation, joint limit verification, and pick-and-place collision checking.',
    longDescription: 'Configured MoveIt 2 setup assistant package for robotic arms. Simulates OMPL motion planners (RRTConnect, PRM) with collision scene monitoring and inverse kinematics calculation.',
    projectSlug: 'industrial-pick-place',
    rosDistro: 'ROS 2 Jazzy',
    simulator: 'RViz2',
    launchCommand: 'ros2 launch ur_robot_driver ur_control.launch.py ur_type:=ur5e use_fake_hardware:=true',
    sensors: ['Joint Position Feedback', 'Torque Sensors', 'TCP End-Effector Pose'],
    features: ['Cartesian Path Planning', 'Collision Matrix Validation', 'Gripper Action Server'],
    previewGradient: 'from-amber-600/20 via-orange-500/15 to-transparent',
  },
  {
    id: 'sim-yolo-vision',
    title: 'Synthetic Vision & Object Detection',
    category: 'Gazebo & Gz Sim',
    tag: 'YOLOv8 • OpenCV',
    description: 'Simulated depth camera video streams paired with TensorRT-accelerated YOLO detection pipelines.',
    longDescription: 'Publishes RGB-D image frames and camera info from a virtual RealSense sensor into ROS 2 image_transport topics for inference benchmarking without physical cameras.',
    projectSlug: 'computer-vision-inspection',
    rosDistro: 'ROS 2 Iron',
    simulator: 'Gazebo Classic 11',
    launchCommand: 'ros2 run vision_inspection yolov8_node --ros-args -p use_sim_time:=True',
    sensors: ['Virtual RealSense D435i', 'Point Cloud Stream', 'Camera Intrinsic Calibration'],
    features: ['Real-time Bounding Boxes', '3D Spatial Coordinate Estimation', 'Synthetic Lighting Variations'],
    previewGradient: 'from-rose-600/20 via-pink-500/15 to-transparent',
  },
  {
    id: 'sim-ag-crop',
    title: 'Autonomous Agriculture Row-Following Sim',
    category: 'Gazebo & Gz Sim',
    tag: 'Crop Rows • PointCloud',
    description: 'Outdoor agricultural digital twin featuring uneven terrain, vegetation meshes, and LiDAR row tracking.',
    longDescription: 'Evaluates agricultural robot navigation along crop furrows. Utilizes 3D point cloud segmentation to calculate heading angles without relying on GPS.',
    projectSlug: 'smart-ag-robot',
    rosDistro: 'ROS 2 Jazzy',
    simulator: 'Gazebo Fortress',
    launchCommand: 'ros2 launch ag_robot row_follower.launch.py sim:=true',
    sensors: ['Ouster 3D LiDAR', 'RTK GPS', 'IMU Attitude Estimator'],
    features: ['Rough Terrain Odometry', 'Crop Row Segmentation', 'Dynamic Steer Angle Regulation'],
    previewGradient: 'from-lime-600/20 via-emerald-500/15 to-transparent',
  }
];

export default function SimulationPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModule, setActiveModule] = useState<SimulationModule>(simulationModules[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const categories = ['All', 'Nav2 & SLAM', 'Gazebo & Gz Sim', 'PX4 Drones', 'Robotic Arms'];

  const filteredModules = selectedCategory === 'All'
    ? simulationModules
    : simulationModules.filter(m => m.category === selectedCategory);

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#B6FFFA] text-[#0B2447] flex flex-col relative selection:bg-[#687EFF]/30 selection:text-[#0B2447]">
      {/* Background Graphic Overlay */}
      <div
        className="fixed inset-0 z-0 opacity-15 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: 'url("/drone-bg.png")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="fixed inset-0 bg-linear-to-b from-[#B6FFFA]/90 via-[#B6FFFA]/80 to-[#B6FFFA] z-0 pointer-events-none" />

      {/* Main Content Container */}
      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full relative z-10 grow">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B2447] text-[#B6FFFA] border border-[#687EFF]/40 mb-4 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-[#687EFF]" />
            <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-wider uppercase">
              Digital Twins & Testing
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#0B2447] mb-5 leading-tight">
            Robot Simulation <span className="text-[#687EFF]">Workspace</span>
          </h1>

          <p className="text-base sm:text-lg text-[#0B2447]/75 leading-relaxed">
            Test and benchmark autonomous navigation, Gazebo digital twins, URDF kinematic arms, and PX4 drone flight software inside virtual ROS 2 environments.
          </p>
        </div>

        {/* Interactive Simulation Console Workbench */}
        <div className="bg-white/95 backdrop-blur-md border border-[#687EFF]/25 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl mb-16 relative overflow-hidden">
          {/* Subtle top ambient accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#687EFF] via-[#B6FFFA] to-[#687EFF]"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Console Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-[#687EFF]/15 text-[#687EFF] border border-[#687EFF]/30 text-xs font-mono font-bold tracking-wide uppercase">
                  {activeModule.tag}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#0B2447] text-[#B6FFFA] text-xs font-mono font-medium">
                  {activeModule.rosDistro}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  Simulator: {activeModule.simulator}
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2447] tracking-tight mb-3">
                  {activeModule.title}
                </h2>
                <p className="text-sm sm:text-base text-[#0B2447]/80 leading-relaxed">
                  {activeModule.longDescription}
                </p>
              </div>

              {/* Terminal Launch Command Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#0B2447]/70">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <Terminal className="w-3.5 h-3.5 text-[#687EFF]" /> ROS 2 Launch Command
                  </span>
                  <span className="text-[11px] text-[#687EFF]">One-Click Copy</span>
                </div>
                <div className="bg-[#0B2447] text-[#B6FFFA] p-4 rounded-2xl flex items-center justify-between gap-3 font-mono text-xs sm:text-sm border border-[#687EFF]/30 shadow-inner overflow-x-auto">
                  <span className="shrink-0 text-emerald-400 select-none">$</span>
                  <code className="grow truncate select-all">{activeModule.launchCommand}</code>
                  <button
                    onClick={() => handleCopyCommand(activeModule.launchCommand)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-[#687EFF] text-white transition-all shrink-0 cursor-pointer active:scale-95"
                    title="Copy command"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Simulated Sensors Grid */}
              <div className="pt-2">
                <h3 className="text-xs font-bold font-mono tracking-wider text-[#0B2447]/70 uppercase mb-2.5">
                  Simulated Sensors & Telemetry
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeModule.sensors.map((sensor, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-[#EAF8FF] border border-[#687EFF]/20 text-[#0B2447] text-xs font-medium"
                    >
                      ✓ {sensor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features & Integration Link */}
              <div className="pt-4 border-t border-[#687EFF]/15 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#0B2447]/70">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Physics verified with collision bounds</span>
                </div>
                {activeModule.projectSlug && (
                  <Link
                    href={`/projects/${activeModule.projectSlug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <span>View Project Package</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column: Visual Simulated Environment Deck */}
            <div className="lg:col-span-5 flex flex-col h-full justify-between space-y-4">
              <div className={`w-full aspect-video rounded-2xl bg-linear-to-br ${activeModule.previewGradient} border border-[#687EFF]/30 p-6 flex flex-col justify-between relative overflow-hidden shadow-inner`}>
                <div className="flex items-center justify-between relative z-10">
                  <span className="flex items-center gap-2 text-xs font-mono font-bold text-[#0B2447]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    SIM ENGINE ACTIVE
                  </span>
                  <div className="p-2 rounded-lg bg-white/70 backdrop-blur-xs text-[#0B2447]">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>

                <div className="relative z-10 space-y-2 text-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#0B2447] text-[#B6FFFA] mx-auto flex items-center justify-center shadow-md">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                  <h4 className="font-bold text-[#0B2447] text-base">{activeModule.simulator} Environment</h4>
                  <p className="text-xs text-[#0B2447]/70">Real-time Gazebo / RViz2 digital twin visualization stream</p>
                </div>

                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#0B2447]/80 pt-2 border-t border-[#0B2447]/10">
                  <span>Gravity: -9.81 m/s²</span>
                  <span>RTF: 1.00x</span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="p-4 rounded-2xl bg-[#EAF8FF] border border-[#687EFF]/20 space-y-2">
                <div className="text-xs font-bold text-[#0B2447] tracking-tight">Key Environment Capabilities</div>
                <ul className="text-xs text-[#0B2447]/80 space-y-1.5">
                  {activeModule.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <span className="text-[#687EFF] font-bold">●</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2447] tracking-tight">
              Simulation Modules
            </h2>
            <p className="text-xs sm:text-sm text-[#0B2447]/70 mt-1">
              Select an environment to load its digital twin configuration.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0B2447] text-[#B6FFFA] shadow-xs'
                    : 'bg-white/80 hover:bg-white text-[#0B2447]/70 hover:text-[#0B2447] border border-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredModules.map((module) => {
            const isSelected = activeModule.id === module.id;
            return (
              <div
                key={module.id}
                onClick={() => {
                  setActiveModule(module);
                  window.scrollTo({ top: 280, behavior: 'smooth' });
                }}
                className={`group relative flex flex-col bg-white rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-sm hover:shadow-xl ${
                  isSelected
                    ? 'border-[#687EFF] ring-2 ring-[#687EFF]/30 bg-white'
                    : 'border-[#687EFF]/20 hover:border-[#687EFF]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-[#687EFF]/10 text-[#687EFF] border border-[#687EFF]/25 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {module.tag}
                  </span>
                  <span className="text-[11px] font-semibold text-[#0B2447]/60">
                    {module.simulator}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0B2447] tracking-tight mb-2 group-hover:text-[#687EFF] transition-colors">
                  {module.title}
                </h3>

                <p className="text-xs text-[#0B2447]/70 line-clamp-3 mb-6 leading-relaxed">
                  {module.description}
                </p>

                <div className="mt-auto pt-4 border-t border-[#687EFF]/15 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-semibold text-[#0B2447]/80">
                    {module.rosDistro}
                  </span>
                  <span className="font-bold text-[#687EFF] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>{isSelected ? "Active Workspace" : "Load Workspace"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hardware & Simulation Integration Callout */}
        <div className="bg-white/90 border border-[#687EFF]/20 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-md space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#687EFF]/15 border border-[#687EFF]/30 flex items-center justify-center text-[#687EFF] mx-auto mb-2 shadow-xs">
            <Box className="w-7 h-7" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2447]">
            Looking for 3D Print CAD Models or Physical Hardware?
          </h3>
          <p className="text-sm text-[#0B2447]/75 max-w-xl mx-auto leading-relaxed">
            Transition your digital twin simulations to physical hardware with our 3D printable STL files and verified components.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link
              href="/3d-models"
              className="px-6 py-3 rounded-full bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              Explore 3D Models
            </Link>
            <Link
              href="/projects"
              className="px-6 py-3 rounded-full bg-white hover:bg-[#EAF8FF] border border-[#687EFF]/30 text-[#0B2447] font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
            >
              Browse Full Projects
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}

