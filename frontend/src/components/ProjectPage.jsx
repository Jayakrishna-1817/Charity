import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Clock, Users, ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import web3Service from '@/services/web3Service';

const ProjectsPage = () => {
  const [visibleProjects, setVisibleProjects] = useState(3);

  const projects = [
    {
      id: 1,
      title: 'Clean Water for Rural Communities',
      charity: 'Global Health Foundation',
      description: 'Providing access to clean drinking water for 10,000 people in remote villages across Africa.',
      image: '/water-project.jpg',
      category: 'Health',
      location: 'Kenya, Africa',
      targetAmount: 50000,
      raisedAmount: 32500,
      donorCount: 245,
      daysLeft: 18,
      urgency: 'high',
      walletAddress: '0xYourCharityWalletAddress1'
    },
    {
      id: 2,
      title: 'Education for Underprivileged Children',
      charity: 'Future Leaders Foundation',
      description: 'Building schools and providing educational resources for children in underserved communities.',
      image: '/education-project.jpg',
      category: 'Education',
      location: 'Bangladesh',
      targetAmount: 25000,
      raisedAmount: 18750,
      donorCount: 156,
      daysLeft: 25,
      urgency: 'medium',
      walletAddress: '0xYourCharityWalletAddress2'
    },
    {
      id: 3,
      title: 'Emergency Food Relief',
      charity: 'World Hunger Relief',
      description: 'Providing emergency food supplies to families affected by natural disasters.',
      image: '/food-relief.jpg',
      category: 'Emergency',
      location: 'Philippines',
      targetAmount: 15000,
      raisedAmount: 12300,
      donorCount: 89,
      daysLeft: 7,
      urgency: 'critical',
      walletAddress: '0xYourCharityWalletAddress3'
    },
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

  const loadMoreProjects = () => {
    setVisibleProjects(prev => prev + 3);
  };

  const handleDonate = async (walletAddress) => {
    try {
      const userAddress = await web3Service.connectWallet();
      const tx = await web3Service.donate(0.01, walletAddress);
      alert(`Donation Successful!\nTX Hash: ${tx.hash}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">All Projects</h1>
        <p className="text-muted-foreground">Browse all available charity projects on our platform</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.slice(0, visibleProjects).map((project, index) => (
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
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-3 left-3">
                  <Badge className={`${getUrgencyColor(project.urgency)} text-white border-0`}>
                    {project.urgency.toUpperCase()}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary">{project.category}</Badge>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-grow">
                <div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{project.description}</p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{project.charity}</p>
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
                    <span className="font-medium">${project.raisedAmount.toLocaleString()} raised</span>
                    <span className="text-gray-500 dark:text-gray-400">of ${project.targetAmount.toLocaleString()}</span>
                  </div>
                  <Progress value={getProgressPercentage(project.raisedAmount, project.targetAmount)} className="h-2" />
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{project.donorCount} donors</span>
                    </div>
                    <span>{getProgressPercentage(project.raisedAmount, project.targetAmount).toFixed(0)}% funded</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-3">
                <Link to={`/projects/${project.id}`}>
                  <Button className="w-full group">
                    <span>View Details</span>
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button variant="secondary" className="w-full" onClick={() => handleDonate(project.walletAddress)}>
                  Donate Now with MetaMask
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {visibleProjects < projects.length && (
        <div className="mt-12 flex justify-center">
          <Button onClick={loadMoreProjects} variant="outline" className="flex items-center gap-2">
            <span>Load More Projects</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectsPage;
