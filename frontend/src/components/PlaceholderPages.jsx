import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Clock, Users, ArrowRight, X, ShieldCheck, Globe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

// Project images
import OIP from '/OIP.jpeg';
import OIP1 from '/OIP1.jpeg';
import OIP2 from '/OIP2.jpeg';

const CharityHealth = "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";
const CharityEducation = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";
const CharityEnvironment = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";

const projects = [
  {
    id: 1,
    title: 'Clean Water for Rural Communities',
    charity: 'Global Health Foundation',
    description: 'Providing access to clean drinking water for 10,000 people in remote villages across Africa.',
    longDescription: 'This project will install 20 water purification systems in rural Kenyan villages, providing sustainable access to clean water for over 10,000 people. Each system includes community training on maintenance and hygiene practices.',
    image: OIP,
    category: 'Health',
    location: 'Kenya, Africa',
    targetAmount: 50000,
    raisedAmount: 32500,
    donorCount: 245,
    daysLeft: 18,
    urgency: 'high'
  },
  {
    id: 2,
    title: 'Education for Underprivileged Children',
    charity: 'Future Leaders Foundation',
    description: 'Building schools and providing educational resources for children in underserved communities.',
    longDescription: 'We will construct 3 new schools in Bangladesh, each equipped with classrooms, libraries, and computer labs. The project includes teacher training and scholarship programs for 600 children annually.',
    image: OIP1,
    category: 'Education',
    location: 'Bangladesh',
    targetAmount: 25000,
    raisedAmount: 18750,
    donorCount: 156,
    daysLeft: 25,
    urgency: 'medium'
  },
  {
    id: 3,
    title: 'Emergency Food Relief',
    charity: 'World Hunger Relief',
    description: 'Providing emergency food supplies to families affected by natural disasters.',
    longDescription: 'This initiative delivers monthly food packages to 1,000 families in typhoon-affected areas of the Philippines. Each package contains rice, canned goods, and other essentials sufficient for one month.',
    image: OIP2,
    category: 'Emergency',
    location: 'Philippines',
    targetAmount: 15000,
    raisedAmount: 12300,
    donorCount: 89,
    daysLeft: 7,
    urgency: 'critical'
  }
];

const verifiedCharities = [
  {
    id: 1,
    name: 'Global Health Foundation',
    description: 'Dedicated to providing healthcare access in developing nations',
    category: 'Health',
    blockchainVerified: true,
    countries: 12,
    beneficiaries: 250000,
    image: CharityHealth,
    blockchainId: '0x8a4d...3f2c'
  },
  {
    id: 2,
    name: 'Future Leaders Education',
    description: 'Building schools and educational programs worldwide',
    category: 'Education',
    blockchainVerified: true,
    countries: 8,
    beneficiaries: 180000,
    image: CharityEducation,
    blockchainId: '0x5b7e...9a1d'
  },
  {
    id: 3,
    name: 'Green Earth Initiative',
    description: 'Environmental conservation and reforestation projects',
    category: 'Environment',
    blockchainVerified: true,
    countries: 15,
    beneficiaries: 350000,
    image: CharityEnvironment,
    blockchainId: '0x3c9f...2e4b'
  }
];

const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    default: return 'bg-green-500';
  }
};

const getProgressPercentage = (raised, target) => {
  return Math.min((raised / target) * 100, 100);
};

export const ProjectsPage = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">All Projects</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-blue-500/20 dark:from-blue-900/20 dark:to-blue-700/20 flex items-center justify-center">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute top-3 left-3">
                  <Badge className={`${getUrgencyColor(project.urgency)} text-white border-0`}>
                    {project.urgency.toUpperCase()}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary">
                    {project.category}
                  </Badge>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-grow">
                <div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {project.description}
                  </p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {project.charity}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{project.daysLeft} days left</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      ${project.raisedAmount.toLocaleString()} raised
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      of ${project.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(project.raisedAmount, project.targetAmount)} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{project.donorCount} donors</span>
                    </div>
                    <span>{getProgressPercentage(project.raisedAmount, project.targetAmount).toFixed(0)}% funded</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Button 
                  className="w-full group"
                  onClick={() => handleViewDetails(project)}
                >
                  <span>View Details</span>
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg mb-6 overflow-hidden">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Project Description</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedProject.longDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Organization</h4>
                    <p>{selectedProject.charity}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Location</h4>
                    <p>{selectedProject.location}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Category</h4>
                    <Badge>{selectedProject.category}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Time Remaining</h4>
                    <p>{selectedProject.daysLeft} days</p>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="font-medium mb-2">Funding Progress</h4>
                  <div className="space-y-2">
                    <Progress 
                      value={getProgressPercentage(selectedProject.raisedAmount, selectedProject.targetAmount)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span>${selectedProject.raisedAmount.toLocaleString()} raised</span>
                      <span>${selectedProject.targetAmount.toLocaleString()} goal</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{selectedProject.donorCount} donors</span>
                      </div>
                      <span>{getProgressPercentage(selectedProject.raisedAmount, selectedProject.targetAmount).toFixed(0)}% funded</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button className="w-full max-w-md py-6 text-lg">
                  Donate Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export const CharitiesPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Verified Charities</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover charitable organizations verified on the blockchain for complete transparency
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {verifiedCharities.map((charity, index) => (
          <motion.div
            key={charity.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
              <img 
                src={charity.image} 
                alt={charity.name}
                className="w-full h-full object-cover"
              />
              {charity.blockchainVerified && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-green-500 text-white flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Blockchain Verified</span>
                  </Badge>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{charity.name}</h3>
                <Badge variant="secondary">{charity.category}</Badge>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{charity.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Globe className="w-4 h-4" />
                  <span>{charity.countries} countries</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{charity.beneficiaries.toLocaleString()} beneficiaries</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Blockchain ID: {charity.blockchainId}
                  </span>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Heart className="w-4 h-4" />
                    <span>Donate</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
          <ShieldCheck className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-sm font-medium">
            All charities are verified on the Ethereum blockchain
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export const ProjectDetail = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="container mx-auto px-4 py-20"
  >
    <h1 className="text-3xl font-bold mb-8">Project Details</h1>
    <p className="text-muted-foreground">Detailed project information and donation interface...</p>
  </motion.div>
);

export const CharityDetail = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="container mx-auto px-4 py-20"
  >
    <h1 className="text-3xl font-bold mb-8">Charity Profile</h1>
    <p className="text-muted-foreground">Detailed charity information and projects...</p>
  </motion.div>
);

export const Dashboard = ({ user }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="container mx-auto px-4 py-20"
  >
    <h1 className="text-3xl font-bold mb-8">
      Welcome back, {user?.firstName || 'User'}!
    </h1>
    <p className="text-muted-foreground">Your donation history and impact dashboard...</p>
  </motion.div>
);