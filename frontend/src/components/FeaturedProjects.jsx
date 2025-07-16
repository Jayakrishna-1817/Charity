import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom"; 
import ProjectsPage from "@/components/ProjectPage";

const FeaturedProjects = () => {
  const projects = [
    {
      id: 1,
      title: "Clean Water for Rural Communities",
      charity: "Global Health Foundation",
      description:
        "Providing access to clean drinking water for 10,000 people in remote villages across Africa.",
      image: "/OIP3.jpeg",
      category: "Health",
      location: "Kenya, Africa",
      targetAmount: 50000,
      raisedAmount: 32500,
      donorCount: 245,
      daysLeft: 18,
      urgency: "high",
    },
    {
      id: 2,
      title: "Education for Underprivileged Children",
      charity: "Future Leaders Foundation",
      description:
        "Building schools and providing educational resources for children in underserved communities.",
      image:
        "https://images.unsplash.com/photo-1600431521340-491eca880813?auto=format&fit=crop&w=800&q=80",
      category: "Education",
      location: "Bangladesh",
      targetAmount: 25000,
      raisedAmount: 18750,
      donorCount: 156,
      daysLeft: 25,
      urgency: "medium",
    },
    {
      id: 3,
      title: "Emergency Food Relief",
      charity: "World Hunger Relief",
      description:
        "Providing emergency food supplies to families affected by natural disasters.",
      image: "/OIP4.jpeg",
      category: "Emergency",
      location: "Philippines",
      targetAmount: 15000,
      raisedAmount: 12300,
      donorCount: 89,
      daysLeft: 7,
      urgency: "critical",
    },
  ];

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getProgressPercentage = (raised, target) => {
    return Math.min((raised / target) * 100, 100);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Featured Projects
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover impactful projects that need your support. Every donation
            is tracked transparently on the blockchain.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-card rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-auto aspect-video object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      className={`${getUrgencyColor(
                        project.urgency
                      )} text-white border-0`}
                    >
                      {project.urgency === "critical"
                        ? "URGENT"
                        : project.urgency.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {project.description}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      {project.charity}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
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
                      <span className="text-muted-foreground">
                        of ${project.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(
                        project.raisedAmount,
                        project.targetAmount
                      )}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{project.donorCount} donors</span>
                      </div>
                      <span>
                        {getProgressPercentage(
                          project.raisedAmount,
                          project.targetAmount
                        ).toFixed(0)}
                        % funded
                      </span>
                    </div>
                  </div>

                  <Button className="w-full group">
                    <span>Donate Now</span>
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ✅ View All Projects - Navigates to /projects route */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/projects">
            <Button variant="outline" size="lg" className="group">
              View All Projects
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
