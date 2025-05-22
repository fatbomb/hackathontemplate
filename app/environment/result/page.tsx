"use client"
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { EnvironmentalData } from '@/types/index';
import Map from '@/components/ScienceSout/Map';
import DataVisualization from '@/components/ScienceSout/DataVisualization';
import { LineChart, TrendingUp, Droplets, Leaf, Cloud, Globe } from 'lucide-react';

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
    eventInfo: "Join our next community science event on June 15th, 2025! Check the Community page for more details.",
    language: "ভাষা: বাংলা",
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
    environmentalImpact: "পরিবেশগত প্রভাব",
    impactText1: "সায়েন্স স্কাউটের মাধ্যমে সংগৃহীত ডেটা প্রকৃত পরিবেশগত গবেষণা এবং সংরক্ষণ প্রচেষ্টায় অবদান রাখে। আমাদের ক্রাউডসোর্সড পদ্ধতি ব্যাপক ডেটা সংগ্রহের জন্য অনুমতি দেয় যা একক গবেষকদের জন্য অসম্ভব হবে।",
    impactText2: "এই গুরুত্বপূর্ণ নাগরিক বিজ্ঞান উদ্যোগে অবদান রাখার জন্য আপনাকে ধন্যবাদ। আপনার পর্যবেক্ষণ আমাদের পরিবর্তনশীল পরিবেশের আরও বিস্তৃত বোঝাপড়া গড়ে তুলতে সাহায্য করে।",
    eventInfo: "আমাদের পরবর্তী কমিউনিটি বিজ্ঞান ইভেন্টে যোগ দিন ১৫ জুন, ২০২৫! আরও বিবরণের জন্য কমিউনিটি পৃষ্ঠা দেখুন।",
    language: "Language: English",
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <Head>
        <title>Environment Dashboard - Science Scout</title>
        <meta name="description" content="Detailed environmental data analysis" />
      </Head>

      {/* Language Toggle Button */}
      <div className="fixed top-4 right-4 z-10">
        <button 
          onClick={toggleLanguage}
          className="flex items-center bg-white px-4 py-2 rounded-full shadow-md hover:bg-gray-50 transition-colors duration-300 border border-green-300"
        >
          <Globe className="h-5 w-5 mr-2 text-green-600" />
          <span className="text-green-800 font-medium">{t.language}</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-green-800 mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{t.totalDataPoints}</h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <LineChart className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-800">{stats.totalEntries}</p>
            <p className="text-sm text-gray-500 mt-2">{t.collectedRecords}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-500 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{t.avgPollutionLevel}</h3>
              <div className="bg-red-100 p-2 rounded-lg">
                <Droplets className="h-6 w-6 text-red-500" />
              </div> 
            </div>
            <p className="text-4xl font-bold text-gray-800">{stats.averagePollution.toFixed(1)}</p>
            <p className="text-sm text-gray-500 mt-2">{t.pollutionScale}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{t.uniqueSpecies}</h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-800">{stats.uniqueSpecies}</p>
            <p className="text-sm text-gray-500 mt-2">{t.documentedBiodiversity}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-yellow-500 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{t.recentWeatherEvents}</h3>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Cloud className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-800">{stats.recentWeatherEvents}</p>
            <p className="text-sm text-gray-500 mt-2">{t.past7Days}</p>
          </div>
        </div>

        {/* Data Type Selector */}
        <div className="mb-12">
          <div className="bg-white p-8 rounded-xl shadow-lg backdrop-blur-lg bg-opacity-90">
            <h2 className="text-3xl font-bold mb-6 text-green-800 flex items-center">
              <TrendingUp className="mr-3 h-7 w-7" />
              {t.dataAnalysis}
            </h2>
            <div className="mb-6">
              <label htmlFor="dataType" className="block text-gray-700 font-bold mb-3">{t.selectDataType}</label>
              <select
                id="dataType"
                className="w-full md:w-72 px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                value={selectedDataType}
                onChange={(e) => setSelectedDataType(e.target.value)}
              >
                <option value="pollution">{t.pollutionData}</option>
                <option value="biodiversity">{t.biodiversityData}</option>
                <option value="weather">{t.weatherData}</option>
              </select>
            </div>

            {/* Data Type Specific Analysis */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-gray-100">
              {selectedDataType === 'pollution' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold mb-3 text-red-700">{t.pollutionAnalysis}</h3>
                  <p className="mb-3 text-gray-700">{t.pollutionAvgText} <strong className="text-red-600 text-lg">{stats.averagePollution.toFixed(1)}</strong> {t.onScale}</p>
                  <p className="text-gray-600">{t.pollutionText}</p>
                </div>
              )}
              {selectedDataType === 'biodiversity' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold mb-3 text-green-700">{t.biodiversityAnalysis}</h3>
                  <p className="mb-3 text-gray-700">{t.biodiversityRecorded} <strong className="text-green-600 text-lg">{stats.uniqueSpecies}</strong> {t.uniqueSpeciesText}</p>
                  <p className="text-gray-600">{t.biodiversityText}</p>
                </div>
              )}
              {selectedDataType === 'weather' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold mb-3 text-yellow-700">{t.weatherAnalysis}</h3>
                  <p className="mb-3 text-gray-700"><strong className="text-yellow-600 text-lg">{stats.recentWeatherEvents}</strong> {t.weatherRecorded}</p>
                  <p className="text-gray-600">{t.weatherText}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Component */}
        <div className="mb-12">
          <div className="bg-white p-8 rounded-xl shadow-lg backdrop-blur-lg bg-opacity-90">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-3xl font-bold text-green-800 mb-4 md:mb-0">{t.environmentalDataMap}</h2>
              <div className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100">
                <label htmlFor="filter" className="mr-3 font-medium text-gray-700">{t.filterMap}</label>
                <select
                  id="filter"
                  className="border-2 border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            <div className="mt-6 rounded-xl overflow-hidden shadow-lg border border-gray-100 h-96">
              {loading ? (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t.loading}</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full bg-red-50">
                  <div className="text-center p-8 text-red-500">
                    <p className="text-xl font-semibold mb-2">{t.errorLoading}</p>
                    <p>{error}</p>
                  </div>
                </div>
              ) : (
                <Map dataPoints={filteredData} />
              )}
            </div>
          </div>
        </div>

        {/* Visualizations */}
        {!loading && !error && (
          <div className="mb-12">
            <div className="bg-white p-8 rounded-xl shadow-lg backdrop-blur-lg bg-opacity-90">
              <h2 className="text-3xl font-bold mb-6 text-green-800">{t.dataVisualizations}</h2>
              <DataVisualization data={data} />
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 p-8 rounded-xl shadow-lg mb-8">
          <h2 className="text-3xl font-bold mb-6 text-green-800">{t.environmentalImpact}</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              {t.impactText1}
            </p>
            <p className="font-medium text-green-700">
              {t.impactText2}
            </p>
            <div className="bg-white bg-opacity-70 p-4 rounded-lg mt-6">
              <p className="text-sm text-gray-600 italic">
                {t.eventInfo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentPage;