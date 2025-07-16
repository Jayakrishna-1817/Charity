import { motion } from 'framer-motion'
import { Wallet, Search, Heart, Shield, CheckCircle, Users } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: Wallet,
      title: 'Connect Your Wallet',
      description: 'Link your MetaMask or other Web3 wallet to get started with secure blockchain donations.',
      color: 'bg-blue-500'
    },
    {
      icon: Search,
      title: 'Find a Cause',
      description: 'Browse verified charities and projects. View detailed information and milestone tracking.',
      color: 'bg-green-500'
    },
    {
      icon: Heart,
      title: 'Make a Donation',
      description: 'Donate any amount with confidence. Your transaction is recorded immutably on the blockchain.',
      color: 'bg-red-500'
    },
    {
      icon: Shield,
      title: 'Track Your Impact',
      description: 'Monitor how your donation is used through milestone updates and transparent reporting.',
      color: 'bg-purple-500'
    }
  ]

  const features = [
    {
      icon: CheckCircle,
      title: 'Milestone-Based Release',
      description: 'Funds are released only when charities complete verified milestones.'
    },
    {
      icon: Shield,
      title: 'Smart Contract Security',
      description: 'All transactions are secured by audited smart contracts on the blockchain.'
    },
    {
      icon: Users,
      title: 'Community Verification',
      description: 'Independent auditors verify charity activities and milestone completion.'
    }
  ]

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Our blockchain-powered platform ensures complete transparency and accountability 
            in every donation you make.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-border z-0">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                    viewport={{ once: true }}
                    className="h-full bg-primary origin-left"
                  />
                </div>
              )}

              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`w-24 h-24 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                >
                  <step.icon className="w-10 h-10 text-white" />
                </motion.div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border">
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks

