import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const Stats = () => {
  const [counts, setCounts] = useState({
    totalDonated: 0,
    projectsFunded: 0,
    charitiesSupported: 0,
    donorsActive: 0
  })

  const finalStats = {
    totalDonated: 2847500, // $2.8M
    projectsFunded: 1247,
    charitiesSupported: 156,
    donorsActive: 5678
  }

  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setCounts({
        totalDonated: Math.floor(finalStats.totalDonated * progress),
        projectsFunded: Math.floor(finalStats.projectsFunded * progress),
        charitiesSupported: Math.floor(finalStats.charitiesSupported * progress),
        donorsActive: Math.floor(finalStats.donorsActive * progress)
      })

      if (currentStep >= steps) {
        clearInterval(timer)
        setCounts(finalStats)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    }
    return num.toLocaleString()
  }

  const stats = [
    {
      label: 'Total Donated',
      value: formatNumber(counts.totalDonated),
      description: 'Raised through our platform',
      color: 'text-green-600'
    },
    {
      label: 'Projects Funded',
      value: counts.projectsFunded.toLocaleString(),
      description: 'Successfully completed',
      color: 'text-blue-600'
    },
    {
      label: 'Charities Supported',
      value: counts.charitiesSupported.toLocaleString(),
      description: 'Verified organizations',
      color: 'text-purple-600'
    },
    {
      label: 'Active Donors',
      value: counts.donorsActive.toLocaleString(),
      description: 'Community members',
      color: 'text-orange-600'
    }
  ]

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">
            Making a Real Impact
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our transparent blockchain platform has enabled thousands of donors 
            to support meaningful causes with complete confidence.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className={`text-3xl lg:text-4xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">100% Transparent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Blockchain Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Smart Contract Secured</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Stats

