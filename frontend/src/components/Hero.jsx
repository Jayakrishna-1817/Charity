import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'
import Lottie from 'lottie-react'
import teamworkAnimation from '@/assets/animations/teamwork.json' // 👈 Local import

const Hero = ({ user, onGetStarted }) => {
  const features = [
    {
      icon: Shield,
      title: 'Transparent',
      description: 'Every donation tracked on blockchain'
    },
    {
      icon: Zap,
      title: 'Instant',
      description: 'Real-time donation processing'
    },
    {
      icon: Globe,
      title: 'Global',
      description: 'Support causes worldwide'
    }
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Blur Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
              >
                <Zap className="w-4 h-4 mr-2" />
                Powered by Blockchain Technology
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="block">Transparent</span>
                <span className="block bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Charitable Giving
                </span>
                <span className="block">for Everyone</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl">
                Experience the future of charitable donations with complete transparency,
                milestone-based fund release, and immutable records on the blockchain.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!user && (
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Start Donating
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              )}

              {user ? (
                <Button
                  size="lg"
                  className="group relative overflow-hidden"
                  asChild
                >
                  <a href="/projects">
                    <span className="relative z-10 flex items-center">
                      Browse Projects
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT ANIMATION */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center items-center"
          >
            <Lottie animationData={teamworkAnimation} loop={true} className="w-full max-w-md" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
