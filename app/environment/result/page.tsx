"use client"
import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { EnvironmentalData } from '@/types/index';
import Map from '@/components/ScienceSout/Map';
import DataVisualization from '@/components/ScienceSout/DataVisualization';
import { LineChart, TrendingUp, Droplets, Leaf, Cloud, Globe, FileSpreadsheet, Info, BarChart3, AlertTriangle, Loader2, MapPin, ChevronRight, Filter, Plus } from 'lucide-react';
import Link from 'next/link';

// Define API response interface
interface ApiResponse {
  success: boolean;
  data: EnvironmentalData[];
  page?: number;
  perPage?: number;
  totalItems?: number;
  totalPages?: number;
}

// Define translations for English and Bangla
const translations = {
  en: {
    title: "Environmental Insights",
    subtitle: "Comprehensive analysis and trends from our collective environmental research data",
    totalDataPoints: "Total Data Points",
    collectedRecords: "Collected environmental records",
    avgPollutionLevel: "Avg. Pollution Level",
    pollutionScale: "Scale of 1-10 severity",
    uniqueSpecies: "Unique Species",
    documentedBiodiversity: "Documented biodiversity",
    recentWeatherEvents: "Recent Weather Events",
    past7Days: "In the past 7 days",
    dataAnalysis: "Data Analysis",
    selectDataType: "Select Data Type",
    pollutionData: "Pollution Data",
    biodiversityData: "Biodiversity Data",
    weatherData: "Weather Data",
    pollutionAnalysis: "Pollution Analysis",
    pollutionAvgText: "Average pollution level across all recorded data points is",
    onScale: "on a scale of 1-10.",
    pollutionText: "Pollution data helps identify areas with high pollution levels that may require intervention or further study. Our citizen scientists are helping map environmental concerns across the region.",
    biodiversityAnalysis: "Biodiversity Analysis",
    biodiversityRecorded: "Our citizen scientists have recorded",
    uniqueSpeciesText: "unique species in the ecosystem.",
    biodiversityText: "Biodiversity data helps track species distribution and identify areas of high ecological value. This information is crucial for conservation planning and environmental protection efforts.",
    weatherAnalysis: "Weather Analysis",
    weatherRecorded: "weather events have been recorded in the past week.",
    weatherText: "Weather data helps identify patterns and correlate environmental changes with climate variations. By monitoring these events, we can better understand the impact of changing climate conditions on local ecosystems.",
    environmentalDataMap: "Environmental Data Map",
    filterMap: "Filter Map:",
    allData: "All Data",
    pollution: "Pollution",
    biodiversity: "Biodiversity",
    weather: "Weather",
    loading: "Loading environmental data...",
    errorLoading: "Error Loading Data",
    dataVisualizations: "Data Visualizations",
    environmentalImpact: "Environmental Impact",
    impactText1: "The data collected through Science Scout contributes to real environmental research and conservation efforts. Our crowdsourced approach allows for widespread data collection that would be impossible for individual researchers.",
    impactText2: "Thank you for contributing to this important citizen science initiative. Your observations help build a more comprehensive understanding of our changing environment.",
    // environmentalImpact: "Environmental Impact",
    // impactText1: "Thank you for contributing to this important citizen science initiative. Your observations help build a more comprehensive understanding of our changing environment.",
    eventInfo: "Join our next community science event on June 15th, 2025! Check the Community page for more details.",
    language: "ভাষা: বাংলা",
    viewDetailedPollutionData: "View Detailed Pollution Data",
    viewDetailedBiodiversityData: "View Detailed Biodiversity Data",
    viewDetailedWeatherData: "View Detailed Weather Data",
    addNewData: "Add New Data",
    advancedFilters: "Advanced Filters",
    contributeData: "Contribute Data",
    mapInteractionHint: "You can zoom and pan the map to explore data points.",

  },
  bn: {
    title: "পরিবেশগত অন্তর্দৃষ্টি",
    subtitle: "আমাদের সম্মিলিত পরিবেশগত গবেষণা ডেটা থেকে বিস্তৃত বিশ্লেষণ এবং প্রবণতা",
    totalDataPoints: "মোট ডেটা পয়েন্ট",
    collectedRecords: "সংগৃহীত পরিবেশগত রেকর্ড",
    avgPollutionLevel: "গড় দূষণের মাত্রা",
    pollutionScale: "১-১০ মাত্রা পরিমাপ",
    uniqueSpecies: "অনন্য প্রজাতি",
    documentedBiodiversity: "নথিভুক্ত জৈববৈচিত্র্য",
    recentWeatherEvents: "সাম্প্রতিক আবহাওয়া ঘটনা",
    past7Days: "গত ৭ দিনে",
    dataAnalysis: "ডেটা বিশ্লেষণ",
    selectDataType: "ডেটা প্রকার নির্বাচন করুন",
    pollutionData: "দূষণের ডেটা",
    biodiversityData: "জৈববৈচিত্র্য ডেটা",
    weatherData: "আবহাওয়া ডেটা",
    pollutionAnalysis: "দূষণ বিশ্লেষণ",
    pollutionAvgText: "সমস্ত রেকর্ড করা ডেটা পয়েন্টের মধ্যে গড় দূষণের মাত্রা হল",
    onScale: "১-১০ মাত্রা পরিমাপে।",
    pollutionText: "দূষণের ডেটা উচ্চ দূষণের স্তর সহ এলাকাগুলি চিহ্নিত করতে সাহায্য করে যা হস্তক্ষেপ বা আরও অধ্যয়নের প্রয়োজন হতে পারে। আমাদের নাগরিক বিজ্ঞানীরা সারা অঞ্চল জুড়ে পরিবেশগত উদ্বেগ মানচিত্র করতে সাহায্য করছেন।",
    biodiversityAnalysis: "জৈববৈচিত্র্য বিশ্লেষণ",
    biodiversityRecorded: "আমাদের নাগরিক বিজ্ঞানীরা রেকর্ড করেছেন",
    uniqueSpeciesText: "ইকোসিস্টেমে অনন্য প্রজাতি।",
    biodiversityText: "জৈববৈচিত্র্য ডেটা প্রজাতি বিতরণ ট্র্যাক করতে এবং উচ্চ পারিস্থিতিক মূল্যের এলাকা চিহ্নিত করতে সাহায্য করে। এই তথ্য সংরক্ষণ পরিকল্পনা এবং পরিবেশ সুরক্ষা প্রচেষ্টার জন্য অত্যন্ত গুরুত্বপূর্ণ।",
    weatherAnalysis: "আবহাওয়া বিশ্লেষণ",
    weatherRecorded: "আবহাওয়া ঘটনা গত সপ্তাহে রেকর্ড করা হয়েছে।",
    weatherText: "আবহাওয়া ডেটা প্যাটার্ন চিহ্নিত করতে এবং পরিবেশগত পরিবর্তনগুলি জলবায়ু পরিবর্তনের সাথে সম্পর্কিত করতে সাহায্য করে। এই ঘটনাগুলি পর্যবেক্ষণ করে, আমরা স্থানীয় বাস্তুসংস্থানের উপর পরিবর্তিত জলবায়ু অবস্থার প্রভাব আরও ভালভাবে বুঝতে পারি।",
    environmentalDataMap: "পরিবেশগত ডেটা মানচিত্র",
    filterMap: "মানচিত্র ফিল্টার করুন:",
    allData: "সমস্ত ডেটা",
    pollution: "দূষণ",
    biodiversity: "জৈববৈচিত্র্য",
    weather: "আবহাওয়া",
    loading: "পরিবেশগত ডেটা লোড হচ্ছে...",
    errorLoading: "ডেটা লোড করার সময় ত্রুটি",
    dataVisualizations: "ডেটা ভিজ্যুয়ালাইজেশন",
    viewDetailedPollutionData: "বিস্তারিত দূষণ ডেটা দেখুন",
    viewDetailedBiodiversityData: "বিস্তারিত জৈববৈচিত্র্য ডেটা দেখুন",
    viewDetailedWeatherData: "বিস্তারিত আবহাওয়া ডেটা দেখুন",
    addNewData: "নতুন ডেটা যোগ করুন",
    mapInteractionHint: "ডেটা পয়েন্ট দেখতে মানচিত্রটি জুম ও প্যান করুন।",
    environmentalImpact: "পরিবেশগত প্রভাব",
    advancedFilters: "উন্নত ফিল্টার",
    // mapInteractionHint: "ডেটা পয়েন্ট দেখতে মানচিত্রটি জুম ও প্যান করুন।",
    contributeData: "ডেটা অবদান রাখুন",
    impactText2: "এই গুরুত্বপূর্ণ নাগরিক বিজ্ঞান উদ্যোগে অবদান রাখার জন্য আপনাকে ধন্যবাদ। আপনার পর্যবেক্ষণ আমাদের পরিবর্তিত পরিবেশ সম্পর্কে আরও ব্যাপক বোঝাপড়া তৈরি করতে সাহায্য করে।",
    impactText1: "এই গুরুত্বপূর্ণ নাগরিক বিজ্ঞান উদ্যোগে অবদান রাখার জন্য আপনাকে ধন্যবাদ। আপনার পর্যবেক্ষণ আমাদের পরিবর্তিত পরিবেশ সম্পর্কে আরও ব্যাপক বোঝাপড়া তৈরি করতে সাহায্য করে।",
    eventInfo: "পরবর্তী কমিউনিটি বিজ্ঞান ইভেন্টে যোগ দিন ১৫ জুন, ২০২৫ তারিখে! আরও বিশদ জানতে কমিউনিটি পৃষ্ঠাটি দেখুন।",
  }
};
  

const EnvironmentPage: React.FC = () => {
  const [data, setData] = useState<EnvironmentalData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pollution' | 'biodiversity' | 'weather'>('all');
  const [selectedDataType, setSelectedDataType] = useState<string>('pollution');
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [stats, setStats] = useState<{
    totalEntries: number;
    averagePollution: number;
    uniqueSpecies: number;
    recentWeatherEvents: number;
  }>({
    totalEntries: 0,
    averagePollution: 0,
    uniqueSpecies: 0,
    recentWeatherEvents: 0
  });

  // Get current translations based on selected language
  const t = translations[language];

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Updated to handle the API response structure
        const response = await axios.get<ApiResponse>('/api/environment/get-data');
        
        // Check if the response has the expected structure
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setData(response.data.data);
          calculateStats(response.data.data);
        } else {
          // Fallback for different response structure
          console.warn('Unexpected API response structure:', response.data);
          const environmentalData = Array.isArray(response.data) ? response.data : [];
          setData(environmentalData);
          calculateStats(environmentalData);
        }
      } catch (err) {
        console.error('Error fetching environmental data:', err);
        setError('Failed to load environmental data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const calculateStats = (environmentalData: EnvironmentalData[]) => {
    // Ensure we have valid data
    if (!Array.isArray(environmentalData) || environmentalData.length === 0) {
      setStats({
        totalEntries: 0,
        averagePollution: 0,
        uniqueSpecies: 0,
        recentWeatherEvents: 0
      });
      return;
    }

    // Calculate total entries
    const totalEntries = environmentalData.length;
    
    // Calculate average pollution (assuming pollution value is 1-10)
    const pollutionData = environmentalData.filter(item => item.dataType === 'pollution');
    const averagePollution = pollutionData.length > 0 
      ? pollutionData.reduce((sum, item) => {
          const value = parseFloat(item.value);
          return sum + (isNaN(value) ? 0 : value);
        }, 0) / pollutionData.length
      : 0;
    
    // Count unique species
    const uniqueSpecies = new Set(
      environmentalData
        .filter(item => item.dataType === 'biodiversity')
        .map(item => item.value.toLowerCase().trim())
        .filter(value => value.length > 0)
    ).size;
    
    // Count recent weather events (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentWeatherEvents = environmentalData.filter(
      item => item.dataType === 'weather' && new Date(item.created) >= oneWeekAgo
    ).length;
    
    setStats({
      totalEntries,
      averagePollution,
      uniqueSpecies,
      recentWeatherEvents
    });
  };

  // Type-safe filtering with proper type checking
  const filteredData = filter === 'all' 
    ? data 
    : data.filter(item => item && item.dataType === filter);

  return (
   <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">

      {/* Fixed Action Buttons */}
      <div className="right-6 bottom-6 z-10 fixed flex flex-col gap-3">
        {/* Add Data Button */}
        <Link href="/environment/form">
          <button className="group flex justify-center items-center bg-gradient-to-r from-green-600 to-green-500 shadow-lg hover:shadow-xl p-4 rounded-full text-white transition-all duration-300">
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </Link>
        
        {/* Language Toggle */}
        <button 
          onClick={toggleLanguage}
          className="flex justify-center items-center bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl p-4 rounded-full transition-all duration-300"
          aria-label="Toggle language"
        >
          <Globe className="w-6 h-6 text-green-600" />
        </button>
      </div>

      <div className="mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-16 text-center">
          <h1 className="bg-clip-text bg-gradient-to-r from-green-700 to-blue-700 mb-6 font-bold text-transparent text-5xl">{t.title}</h1>
          <p className="opacity-75 mx-auto max-w-3xl text-gray-600 dark:text-gray-300 text-xl">{t.subtitle}</p>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/environment/form">
              <button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 shadow-md hover:shadow-lg px-6 py-3 rounded-lg text-white transition-all duration-300">
                <FileSpreadsheet className="w-5 h-5" />
                <span>{t.addNewData}</span>
              </button>
            </Link>
            
            <button className="flex items-center gap-2 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg px-6 py-3 rounded-lg text-gray-900 dark:text-white transition-all duration-300">
              <Filter className="w-5 h-5 text-green-600" />
              <span>{t.advancedFilters}</span>
            </button>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <div className="bg-gradient-to-br from-white dark:from-gray-800 to-blue-50 dark:to-gray-700 shadow-md hover:shadow-lg p-6 rounded-2xl transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="opacity-75 font-semibold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">{t.totalDataPoints}</h3>
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <LineChart className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-4xl">{stats.totalEntries}</p>
            <div className="flex items-center opacity-75 mt-2 text-gray-600 dark:text-gray-300 text-sm">
              <Info className="mr-1 w-4 h-4" />
              <p>{t.collectedRecords}</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white dark:from-gray-800 to-red-50 dark:to-gray-700 shadow-md hover:shadow-lg p-6 rounded-2xl transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="opacity-75 font-semibold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">{t.avgPollutionLevel}</h3>
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg">
                <Droplets className="w-6 h-6 text-red-500" />
              </div> 
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-4xl">{stats.averagePollution.toFixed(1)}</p>
            <div className="flex items-center opacity-75 mt-2 text-gray-600 dark:text-gray-300 text-sm">
              <Info className="mr-1 w-4 h-4" />
              <p>{t.pollutionScale}</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white dark:from-gray-800 to-green-50 dark:to-gray-700 shadow-md hover:shadow-lg p-6 rounded-2xl transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="opacity-75 font-semibold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">{t.uniqueSpecies}</h3>
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-4xl">{stats.uniqueSpecies}</p>
            <div className="flex items-center opacity-75 mt-2 text-gray-600 dark:text-gray-300 text-sm">
              <Info className="mr-1 w-4 h-4" />
              <p>{t.documentedBiodiversity}</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white dark:from-gray-800 to-yellow-50 dark:to-gray-700 shadow-md hover:shadow-lg p-6 rounded-2xl transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="opacity-75 font-semibold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">{t.recentWeatherEvents}</h3>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg">
                <Cloud className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-4xl">{stats.recentWeatherEvents}</p>
            <div className="flex items-center opacity-75 mt-2 text-gray-600 dark:text-gray-300 text-sm">
              <Info className="mr-1 w-4 h-4" />
              <p>{t.past7Days}</p>
            </div>
          </div>
        </div>

        {/* Data Type Selector */}
        <div className="mb-16">
          <div className="bg-white dark:bg-gray-800 shadow-md backdrop-blur-lg p-8 rounded-2xl">
            <div className="flex md:flex-row flex-col md:justify-between md:items-center mb-6">
              <h2 className="flex items-center font-bold text-gray-900 dark:text-white text-3xl">
                <TrendingUp className="mr-3 w-7 h-7 text-green-600" />
                {t.dataAnalysis}
              </h2>
              
              <div className="mt-4 md:mt-0">
                <select
                  id="dataType"
                  className="bg-white dark:bg-gray-700 shadow-sm px-4 py-2 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  value={selectedDataType}
                  onChange={(e) => setSelectedDataType(e.target.value)}
                >
                  <option value="pollution">{t.pollutionData}</option>
                  <option value="biodiversity">{t.biodiversityData}</option>
                  <option value="weather">{t.weatherData}</option>
                </select>
              </div>
            </div>

            {/* Data Type Specific Analysis */}
            <div className="bg-gradient-to-r from-green-50 dark:from-gray-700 to-blue-50 dark:to-gray-600 p-6 rounded-xl">
              {selectedDataType === 'pollution' && (
                <div className="space-y-3">
                  <h3 className="flex items-center mb-3 font-semibold text-red-700 dark:text-red-400 text-xl">
                    <Droplets className="mr-2 w-5 h-5" />
                    {t.pollutionAnalysis}
                  </h3>
                  <p className="mb-3 text-gray-800 dark:text-gray-200">{t.pollutionAvgText} <strong className="text-red-600 dark:text-red-400 text-lg">{stats.averagePollution.toFixed(1)}</strong> {t.onScale}</p>
                  <p className="opacity-75 text-gray-600 dark:text-gray-300">{t.pollutionText}</p>
                  
                  <div className="mt-4 pt-4 border-gray-200 dark:border-gray-600 border-t">
                    <Link href="/environment/pollution">
                      <button className="flex items-center text-red-600 hover:text-red-700 dark:hover:text-red-300 dark:text-red-400 transition-colors duration-200">
                        <span>{t.viewDetailedPollutionData}</span>
                        <ChevronRight className="ml-1 w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              )}
              
              {selectedDataType === 'biodiversity' && (
                <div className="space-y-3">
                  <h3 className="flex items-center mb-3 font-semibold text-green-700 dark:text-green-400 text-xl">
                    <Leaf className="mr-2 w-5 h-5" />
                    {t.biodiversityAnalysis}
                  </h3>
                  <p className="mb-3 text-gray-800 dark:text-gray-200">{t.biodiversityRecorded} <strong className="text-green-600 dark:text-green-400 text-lg">{stats.uniqueSpecies}</strong> {t.uniqueSpeciesText}</p>
                  <p className="opacity-75 text-gray-600 dark:text-gray-300">{t.biodiversityText}</p>
                  
                  <div className="mt-4 pt-4 border-gray-200 dark:border-gray-600 border-t">
                    <Link href="/environment/biodiversity">
                      <button className="flex items-center text-green-600 hover:text-green-700 dark:hover:text-green-300 dark:text-green-400 transition-colors duration-200">
                        <span>{t.viewDetailedBiodiversityData}</span>
                        <ChevronRight className="ml-1 w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              )}
              
              {selectedDataType === 'weather' && (
                <div className="space-y-3">
                  <h3 className="flex items-center mb-3 font-semibold text-yellow-700 dark:text-yellow-400 text-xl">
                    <Cloud className="mr-2 w-5 h-5" />
                    {t.weatherAnalysis}
                  </h3>
                  <p className="mb-3 text-gray-800 dark:text-gray-200"><strong className="text-yellow-600 dark:text-yellow-400 text-lg">{stats.recentWeatherEvents}</strong> {t.weatherRecorded}</p>
                  <p className="opacity-75 text-gray-600 dark:text-gray-300">{t.weatherText}</p>
                  
                  <div className="mt-4 pt-4 border-gray-200 dark:border-gray-600 border-t">
                    <Link href="/environment/weather">
                      <button className="flex items-center text-yellow-600 hover:text-yellow-700 dark:hover:text-yellow-300 dark:text-yellow-400 transition-colors duration-200">
                        <span>{t.viewDetailedWeatherData}</span>
                        <ChevronRight className="ml-1 w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Component */}
        <div className="mb-16">
          <div className="bg-white dark:bg-gray-800 shadow-md backdrop-blur-lg p-8 rounded-2xl">
            <div className="flex md:flex-row flex-col md:justify-between md:items-center mb-6">
              <h2 className="flex items-center font-bold text-gray-900 dark:text-white text-3xl">
                <MapPin className="mr-3 w-7 h-7 text-green-600" />
                {t.environmentalDataMap}
              </h2>
              
              <div className="mt-4 md:mt-0">
                <select
                  id="filter"
                  className="bg-white dark:bg-gray-700 shadow-sm px-4 py-2 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'pollution' | 'biodiversity' | 'weather')}
                >
                  <option value="all">{t.allData}</option>
                  <option value="pollution">{t.pollution}</option>
                  <option value="biodiversity">{t.biodiversity}</option>
                  <option value="weather">{t.weather}</option>
                </select>
              </div>
            </div>
            
            <div className="shadow-md mt-6 rounded-xl h-[450px] overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center bg-gray-50 dark:bg-gray-700 h-full">
                  <div className="p-8 text-center">
                    <Loader2 className="mx-auto mb-4 w-12 h-12 text-green-600 animate-spin" />
                    <p className="opacity-75 text-gray-600 dark:text-gray-300">{t.loading}</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center bg-red-50 dark:bg-red-900/20 h-full">
                  <div className="p-8 text-red-500 dark:text-red-400 text-center">
                    <AlertTriangle className="mx-auto mb-4 w-12 h-12" />
                    <p className="mb-2 font-semibold text-xl">{t.errorLoading}</p>
                    <p>{error}</p>
                  </div>
                </div>
              ) : (
                <Map dataPoints={filteredData} />
              )}
            </div>
            
            <div className="flex items-center opacity-75 mt-4 text-gray-600 dark:text-gray-300 text-sm">
              <Info className="mr-1 w-4 h-4" />
              <p>{t.mapInteractionHint}</p>
            </div>
          </div>
        </div>

        {/* Visualizations */}
        {!loading && !error && (
          <div className="mb-16">
            <div className="bg-white dark:bg-gray-800 shadow-md backdrop-blur-lg p-8 rounded-2xl">
              <h2 className="flex items-center mb-6 font-bold text-gray-900 dark:text-white text-3xl">
                <BarChart3 className="mr-3 w-7 h-7 text-green-600" />
                {t.dataVisualizations}
              </h2>
              <DataVisualization data={data} />
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-gradient-to-r from-green-50 dark:from-gray-800 to-blue-50 dark:to-gray-700 shadow-md mb-8 p-8 rounded-2xl">
          <h2 className="flex items-center mb-6 font-bold text-gray-900 dark:text-white text-3xl">
            <Leaf className="mr-3 w-7 h-7 text-green-600" />
            {t.environmentalImpact}
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-800 dark:text-gray-200">{t.impactText1}</p>
            <p className="font-medium text-green-700 dark:text-green-400">{t.impactText2}</p>
            
            <div className="bg-white dark:bg-gray-700 bg-opacity-70 dark:bg-opacity-70 mt-6 p-6 border border-green-100 dark:border-green-800 rounded-lg">
              <div className="flex">
                <Info className="flex-shrink-0 mt-0.5 mr-2 w-5 h-5 text-green-600" />
                <p className="opacity-75 text-gray-600 dark:text-gray-300 text-sm italic">{t.eventInfo}</p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link href="/environment/form">
                <button className="flex items-center bg-gradient-to-r from-green-600 to-green-500 shadow-md hover:shadow-lg mx-auto px-8 py-4 rounded-lg text-white transition-all duration-300">
                  <FileSpreadsheet className="mr-2 w-5 h-5" />
                  <span>{t.contributeData}</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentPage;