"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Globe, 
  ChevronRight, 
  Clipboard, 
  MapPin, 
  Cloud, 
  ArrowLeft, 
  Sparkles, 
  BarChart4, 
  Database, 
  Leaf,
  LineChart,
  FileSpreadsheet,
  Share2
} from 'lucide-react';
import DataForm from '@/components/ScienceSout/DataForm';
import { motion } from 'framer-motion';

export default function Form() {
  const [language, setLanguage] = useState<keyof typeof content>('english');
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const content = {
    english: {
      title: "Science Scout",
      subtitle: "Crowdsourced Environmental Data Collection",
      aboutTitle: "About Science Scout",
      aboutText: "Science Scout is a citizen science platform that allows anyone to contribute valuable environmental data. By submitting observations about pollution levels, biodiversity sightings, or weather conditions, you help scientists build a comprehensive picture of our changing environment.",
      dataNote: "All data is geolocated and securely stored, making it valuable for research and conservation efforts.",
      dashboardLink: "View Data Dashboard",
      backToHome: "Back to Home",
      submitData: "Submit Your Observations",
      switchToOther: "বাংলা দেখুন",
      formTitle: "Data Submission Form",
      together: "Together, we can make a difference",
      alreadyContributed: "Over 5,000 people have already contributed",
      features: [
        { title: "Geolocated Data", description: "Automatically tags your observations with precise location data", icon: MapPin },
        { title: "Simple Submission", description: "User-friendly forms make it easy to contribute", icon: Clipboard },
        { title: "Real-time Updates", description: "See new data as it comes in from around the world", icon: Cloud }
      ],
      benefits: [
        { title: "Support Research", description: "Your data helps scientists track environmental changes", icon: LineChart },
        { title: "Protect Biodiversity", description: "Identify threatened species and habitats", icon: Leaf },
        { title: "Drive Action", description: "Contribute to evidence-based environmental policies", icon: FileSpreadsheet }
      ]
    },
    bangla: {
      title: "সায়েন্স স্কাউট",
      subtitle: "সম্মিলিত পরিবেশ তথ্য সংগ্রহ",
      aboutTitle: "সায়েন্স স্কাউট সম্পর্কে",
      aboutText: "সায়েন্স স্কাউট একটি নাগরিক বিজ্ঞান প্ল্যাটফর্ম যা যে কাউকে মূল্যবান পরিবেশগত তথ্য দিতে সাহায্য করে। দূষণের মাত্রা, জীববৈচিত্র্য পর্যবেক্ষণ বা আবহাওয়ার অবস্থা সম্পর্কে পর্যবেক্ষণ জমা দিয়ে, আপনি বিজ্ঞানীদের আমাদের পরিবর্তনশীল পরিবেশের একটি ব্যাপক চিত্র তৈরি করতে সাহায্য করেন।",
      dataNote: "সমস্ত তথ্য ভৌগলিকভাবে অবস্থিত এবং নিরাপদে সংরক্ষিত, যা গবেষণা এবং সংরক্ষণ প্রচেষ্টার জন্য মূল্যবান।",
      dashboardLink: "ডাটা ড্যাশবোর্ড দেখুন",
      backToHome: "হোম পেজে ফিরে যান",
      submitData: "আপনার পর্যবেক্ষণ জমা দিন",
      switchToOther: "View in English",
      formTitle: "তথ্য জমা ফর্ম",
      together: "একসাথে, আমরা পার্থক্য করতে পারি",
      alreadyContributed: "ইতিমধ্যে ৫,০০০ এরও বেশি লোক অবদান রেখেছেন",
      features: [
        { title: "ভৌগলিক তথ্য", description: "আপনার পর্যবেক্ষণগুলিকে সঠিক অবস্থান তথ্য দিয়ে স্বয়ংক্রিয়ভাবে ট্যাগ করে", icon: MapPin },
        { title: "সহজ জমা", description: "ব্যবহারকারী-বান্ধব ফর্মগুলি অবদান রাখা সহজ করে তোলে", icon: Clipboard },
        { title: "রিয়েল-টাইম আপডেট", description: "বিশ্বজুড়ে নতুন তথ্য আসার সাথে সাথে দেখুন", icon: Cloud }
      ],
      benefits: [
        { title: "গবেষণা সমর্থন", description: "আপনার ডেটা বিজ্ঞানীদের পরিবেশগত পরিবর্তন ট্র্যাক করতে সাহায্য করে", icon: LineChart },
        { title: "জীববৈচিত্র্য রক্ষা", description: "বিপন্ন প্রজাতি এবং বাসস্থান চিহ্নিত করুন", icon: Leaf },
        { title: "কর্ম চালান", description: "প্রমাণ-ভিত্তিক পরিবেশ নীতিতে অবদান রাখুন", icon: FileSpreadsheet }
      ]
    }
  };

  const activeContent = content[language];

  const toggleLanguage = () => {
    setLanguage(language === 'english' ? 'bangla' : 'english');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen">
      

      {/* Header */}
      <div className={`sticky top-0 z-10 transition-all duration-300 ${
        scrolled ? ' shadow-md py-3' : ' py-5'
      }`}>
        <div className="flex justify-between items-center mx-auto px-4 md:px-8 container">
          <div className="flex items-center space-x-2">
  
            <div>
              <h1 className="flex items-center font-bold text-primary text-2xl md:text-3xl">
                <Sparkles className="mr-2 w-6 h-6" />
                {activeContent.title}
              </h1>
              <p className="text-primary text-sm md:text-base">{activeContent.subtitle}</p>
            </div>
          </div>
          
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg text-primary transition-colors"
          >
            <Globe size={18} />
            <span className="hidden sm:inline">{activeContent.switchToOther}</span>
          </button>
        </div>
      </div>

      <main className="mx-auto px-4 md:px-8 py-8 container">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl mb-16 rounded-2xl overflow-hidden"
        >
          <div className="lg:grid lg:grid-cols-5">
            {/* Info Section */}
            <div className="lg:col-span-2 p-8 lg:pr-0">
              <div className="lg:pr-6">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-flex items-center mb-6 font-bold text-green-800 text-3xl"
                >
                  <Database className="mr-3 w-7 h-7 text-green-600" />
                  {activeContent.aboutTitle}
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-4 text-gray-700 leading-relaxed"
                >
                  {activeContent.aboutText}
                </motion.p>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex items-start mb-8 text-gray-600"
                >
                  <Leaf className="flex-shrink-0 mt-0.5 mr-2 w-5 h-5 text-green-500" />
                  {activeContent.dataNote}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="space-y-4"
                >
                  <Link href="/environment/result">
                    <button className="inline-flex justify-center items-center bg-gradient-to-r from-blue-600 hover:from-blue-700 to-blue-500 hover:to-blue-600 shadow-md hover:shadow-lg px-6 py-3 rounded-lg w-full sm:w-auto text-white transition-all">
                      <BarChart4 size={18} className="mr-2" />
                      {activeContent.dashboardLink}
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </Link>
                  
                  <p className="flex justify-center sm:justify-start items-center mt-4 text-gray-500 text-sm">
                    <Share2 size={14} className="mr-2 text-green-500" />
                    {activeContent.alreadyContributed}
                  </p>
                </motion.div>
              </div>
            </div>
            
            {/* Form Container */}
            <div className="lg:col-span-3 bg-gradient-to-br from-green-50 to-blue-50">
              <div className="p-8">
                <h3 className="flex items-center mb-6 font-bold text-green-800 text-2xl">
                  <Clipboard className="mr-2 w-6 h-6 text-green-600" />
                  {activeContent.formTitle}
                </h3>
                
                <div className="bg-white shadow-md p-6 rounded-xl">
                  <DataForm language={language} />
                </div>
                
                <p className="mt-6 text-gray-600 text-center italic">
                  {activeContent.together}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="mb-8 font-bold text-2xl text-center">
            <span className="bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 text-transparent">
              Why Contribute?
            </span>
          </h2>
          
          <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
            {activeContent.benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className="bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-blue-50 shadow-md hover:shadow-lg p-6 border border-gray-100 rounded-xl transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="inline-block bg-gradient-to-br from-green-100 to-green-200 mb-4 p-3 rounded-xl text-green-700">
                    <Icon size={24} />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-800 text-xl">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Features Section */}
        
        
                {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="bg-gradient-to-r from-green-600 to-blue-600 shadow-xl rounded-2xl overflow-hidden">
            <div className="px-8 py-12 md:py-16 text-white text-center">
              <h2 className="mb-6 font-bold text-3xl md:text-4xl">{activeContent.submitData}</h2>
              <p className="mx-auto mb-8 max-w-2xl text-white/80">
                {activeContent.dataNote}
              </p>
              
              <div className="flex sm:flex-row flex-col justify-center gap-4">
                <Link href="#top" scroll={false}>
                  <button className="flex justify-center items-center bg-white hover:bg-green-50 shadow-md px-8 py-4 rounded-lg text-green-700 transition-colors">
                    <Clipboard size={18} className="mr-2" />
                    {activeContent.submitData}
                  </button>
                </Link>
                
                <Link href="/environment/result">
                  <button className="flex justify-center items-center bg-white/10 hover:bg-white/20 shadow-md backdrop-blur-sm px-8 py-4 rounded-lg text-white transition-colors">
                    <BarChart4 size={18} className="mr-2" />
                    {activeContent.dashboardLink}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Trust Indicators */}
       
      </main>

      {/* Footer */}
      
      
      {/* Back to top button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: scrolled ? 1 : 0, y: scrolled ? 0 : 10 }}
        transition={{ duration: 0.3 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="right-6 bottom-6 z-10 fixed bg-green-600 hover:bg-green-700 shadow-lg p-3 rounded-full text-white"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </motion.button>
    </div>
  );
}