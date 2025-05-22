"use client";
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Globe, ChevronRight, Clipboard, MapPin, Cloud } from 'lucide-react';
import DataForm from '@/components/ScienceSout/DataForm';

export default function Form() {
  const [language, setLanguage] = useState('english');

  const content = {
    english: {
      title: "Science Scout",
      subtitle: "Crowdsourced Environmental Data Collection",
      aboutTitle: "About Science Scout",
      aboutText: "Science Scout is a citizen science platform that allows anyone to contribute valuable environmental data. By submitting observations about pollution levels, biodiversity sightings, or weather conditions, you help scientists build a comprehensive picture of our changing environment.",
      dataNote: "All data is geolocated and securely stored, making it valuable for research and conservation efforts.",
      dashboardLink: "View Data Dashboard",
      switchToOther: "বাংলা দেখুন",
      features: [
        { title: "Geolocated Data", description: "Automatically tags your observations with precise location data", icon: MapPin },
        { title: "Simple Submission", description: "User-friendly forms make it easy to contribute", icon: Clipboard },
        { title: "Real-time Updates", description: "See new data as it comes in from around the world", icon: Cloud }
      ]
    },
    bangla: {
      title: "সায়েন্স স্কাউট",
      subtitle: "সম্মিলিত পরিবেশ তথ্য সংগ্রহ",
      aboutTitle: "সায়েন্স স্কাউট সম্পর্কে",
      aboutText: "সায়েন্স স্কাউট একটি নাগরিক বিজ্ঞান প্ল্যাটফর্ম যা যে কাউকে মূল্যবান পরিবেশগত তথ্য দিতে সাহায্য করে। দূষণের মাত্রা, জীববৈচিত্র্য পর্যবেক্ষণ বা আবহাওয়ার অবস্থা সম্পর্কে পর্যবেক্ষণ জমা দিয়ে, আপনি বিজ্ঞানীদের আমাদের পরিবর্তনশীল পরিবেশের একটি ব্যাপক চিত্র তৈরি করতে সাহায্য করেন।",
      dataNote: "সমস্ত তথ্য ভৌগলিকভাবে অবস্থিত এবং নিরাপদে সংরক্ষিত, যা গবেষণা এবং সংরক্ষণ প্রচেষ্টার জন্য মূল্যবান।",
      dashboardLink: "ডাটা ড্যাশবোর্ড দেখুন",
      switchToOther: "View in English",
      features: [
        { title: "ভৌগলিক তথ্য", description: "আপনার পর্যবেক্ষণগুলিকে সঠিক অবস্থান তথ্য দিয়ে স্বয়ংক্রিয়ভাবে ট্যাগ করে", icon: MapPin },
        { title: "সহজ জমা", description: "ব্যবহারকারী-বান্ধব ফর্মগুলি অবদান রাখা সহজ করে তোলে", icon: Clipboard },
        { title: "রিয়েল-টাইম আপডেট", description: "বিশ্বজুড়ে নতুন তথ্য আসার সাথে সাথে দেখুন", icon: Cloud }
      ]
    }
  };

  const activeContent = content[language];

  const toggleLanguage = () => {
    setLanguage(language === 'english' ? 'bangla' : 'english');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <Head>
        <title>{activeContent.title} | Citizen Science</title>
        <meta name="description" content="Contribute to environmental research through citizen science" />
      </Head>

      {/* Header */}
      <header className="bg-green-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{activeContent.title}</h1>
            <p className="text-green-100">{activeContent.subtitle}</p>
          </div>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition-colors"
          >
            <Globe size={18} />
            <span>{activeContent.switchToOther}</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-10">
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-semibold text-green-800 mb-4">{activeContent.aboutTitle}</h2>
              <p className="text-gray-700 mb-4">{activeContent.aboutText}</p>
              <p className="text-gray-700 mb-6">{activeContent.dataNote}</p>
              <Link href="/environment/result" className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                {activeContent.dashboardLink}
                <ChevronRight size={18} className="ml-2" />
              </Link>
            </div>
            <div className="md:w-1/2 bg-green-100 p-8 flex items-center justify-center">
              <div className="w-full max-w-md">
                <DataForm language={language} />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {activeContent.features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="inline-block p-3 bg-green-100 rounded-full text-green-700 mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="md:flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold mb-2">{activeContent.title}</h2>
              <p className="text-gray-400">&copy; {new Date().getFullYear()} Science Scout. All rights reserved.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-300 hover:text-white mr-4">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-300 hover:text-white mr-4">Terms of Service</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}