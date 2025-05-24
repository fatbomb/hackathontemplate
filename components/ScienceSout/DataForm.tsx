
  import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { LocationData } from '@/types/index';

interface FormValues {
  dataType: 'pollution' | 'biodiversity' | 'weather';
  value: string;
  notes: string;
  latitude: number | string;
  longitude: number | string;
  images: FileList | null;
}

interface DataFormProps {
  language?: 'english' | 'bangla';
}

const DataForm: React.FC<DataFormProps> = ({ language = 'english' }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Language content
  const content = {
    english: {
      title: "Submit Environmental Data",
      successMessage: "Data submitted successfully! Thank you for your contribution.",
      dataTypeLabel: "Type of Data",
      dataTypes: {
        pollution: "Pollution Level",
        biodiversity: "Biodiversity Sighting",
        weather: "Weather Observation"
      },
      valueLabels: {
        pollution: "Pollution Level",
        biodiversity: "Species Observed",
        weather: "Weather Conditions"
      },
      pollutionLevels: {
        moderate: "Moderate",
        unhealthy: "Unhealthy",
        very_unhealthy: "Very Unhealthy",
        hazardous: "Hazardous"
      },
      biodiversityTypes: {
        birds: "Birds",
        mammals: "Mammals",
        insects: "Insects",
        plants: "Plants",
        reptiles: "Reptiles",
        amphibians: "Amphibians",
        fish: "Fish",
        other: "Other"
      },
      weatherConditions: {
        sunny: "Sunny",
        cloudy: "Cloudy",
        rainy: "Rainy",
        stormy: "Stormy",
        foggy: "Foggy",
        windy: "Windy",
        snowy: "Snowy",
        hot: "Hot",
        cold: "Cold"
      },
      notesLabel: "Additional Notes",
      imagesLabel: "Upload Images",
      locationLabel: "Location",
      latitudeLabel: "Latitude",
      longitudeLabel: "Longitude",
      locationWaiting: "Waiting for location... Please enable location services.",
      submitButton: "Submit Data",
      submittingButton: "Submitting...",
      requiredError: "Required",
      selectPlaceholder: "Select pollution level",
      selectBiodiversityPlaceholder: "Select species type",
      selectWeatherPlaceholder: "Select weather condition"
    },
    bangla: {
      title: "পরিবেশগত তথ্য জমা দিন",
      successMessage: "তথ্য সফলভাবে জমা দেওয়া হয়েছে! আপনার অবদানের জন্য ধন্যবাদ।",
      dataTypeLabel: "তথ্যের ধরন",
      dataTypes: {
        pollution: "দূষণের মাত্রা",
        biodiversity: "জীববৈচিত্র্য পর্যবেক্ষণ",
        weather: "আবহাওয়া পর্যবেক্ষণ"
      },
      valueLabels: {
        pollution: "দূষণের মাত্রা",
        biodiversity: "পর্যবেক্ষিত প্রজাতি",
        weather: "আবহাওয়ার অবস্থা"
      },
      pollutionLevels: {
        moderate: "মাঝারি",
        unhealthy: "অস্বাস্থ্যকর",
        very_unhealthy: "অত্যন্ত অস্বাস্থ্যকর",
        hazardous: "বিপজ্জনক"
      },
      biodiversityTypes: {
        birds: "পাখি",
        mammals: "স্তন্যপায়ী",
        insects: "পোকামাকড়",
        plants: "উদ্ভিদ",
        reptiles: "সরীসৃপ",
        amphibians: "উভচর",
        fish: "মাছ",
        other: "অন্যান্য"
      },
      weatherConditions: {
        sunny: "রৌদ্রোজ্জ্বল",
        cloudy: "মেঘলা",
        rainy: "বৃষ্টি",
        stormy: "ঝড়",
        foggy: "কুয়াশা",
        windy: "বাতাস",
        snowy: "তুষার",
        hot: "গরম",
        cold: "ঠান্ডা"
      },
      notesLabel: "অতিরিক্ত মন্তব্য",
      imagesLabel: "ছবি আপলোড করুন",
      locationLabel: "অবস্থান",
      latitudeLabel: "অক্ষাংশ",
      longitudeLabel: "দ্রাঘিমাংশ",
      locationWaiting: "অবস্থানের জন্য অপেক্ষা করা হচ্ছে... দয়া করে অবস্থান সেবা সক্ষম করুন।",
      submitButton: "তথ্য জমা দিন",
      submittingButton: "জমা দেওয়া হচ্ছে...",
      requiredError: "প্রয়োজনীয়",
      selectPlaceholder: "দূষণের মাত্রা নির্বাচন করুন",
      selectBiodiversityPlaceholder: "প্রজাতির ধরন নির্বাচন করুন",
      selectWeatherPlaceholder: "আবহাওয়ার অবস্থা নির্বাচন করুন"
    }
  };

  const activeContent = content[language];

  useEffect(() => {
    // Get user's location if they allow it
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const validationSchema = Yup.object({
    dataType: Yup.string().required(activeContent.requiredError),
    value: Yup.string().required(activeContent.requiredError),
    notes: Yup.string(),
    latitude: Yup.number().required('Location is required'),
    longitude: Yup.number().required('Location is required'),
    images: Yup.mixed(),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      dataType: 'pollution',
      value: '',
      notes: '',
      latitude: location?.lat || '',
      longitude: location?.lng || '',
      images: null,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        const formData = new FormData();
        formData.append('dataType', values.dataType);
        formData.append('value', values.value);
        formData.append('notes', values.notes);
        formData.append('latitude', String(values.latitude));
        formData.append('longitude', String(values.longitude));
        
        // Append images if they exist
        if (values.images) {
          Array.from(values.images).forEach((file, index) => {
            formData.append(`images`, file);
          });
        }

        await axios.post('/api/environment/submit-data', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSubmitSuccess(true);
        formik.resetForm();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setSubmitError(error.response.data.message || 'An error occurred');
        } else {
          setSubmitError('An error occurred');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (location) {
      formik.setFieldValue('latitude', location.lat);
      formik.setFieldValue('longitude', location.lng);
    }
  }, [location]);

  const getValueLabel = () => {
    return activeContent.valueLabels[formik.values.dataType];
  };

  const renderValueInput = () => {
    if (formik.values.dataType === 'pollution') {
      return (
        <select
          id="value"
          name="value"
          className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 w-full text-gray-900 dark:text-gray-100"
          onChange={formik.handleChange}
          value={formik.values.value}
        >
          <option value="">{activeContent.selectPlaceholder}</option>
          <option value="moderate">{activeContent.pollutionLevels.moderate}</option>
          <option value="unhealthy">{activeContent.pollutionLevels.unhealthy}</option>
          <option value="very_unhealthy">{activeContent.pollutionLevels.very_unhealthy}</option>
          <option value="hazardous">{activeContent.pollutionLevels.hazardous}</option>
        </select>
      );
    } else if (formik.values.dataType === 'biodiversity') {
      return (
        <select
          id="value"
          name="value"
          className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 w-full text-gray-900 dark:text-gray-100"
          onChange={formik.handleChange}
          value={formik.values.value}
        >
          <option value="">{activeContent.selectBiodiversityPlaceholder}</option>
          <option value="birds">{activeContent.biodiversityTypes.birds}</option>
          <option value="mammals">{activeContent.biodiversityTypes.mammals}</option>
          <option value="insects">{activeContent.biodiversityTypes.insects}</option>
          <option value="plants">{activeContent.biodiversityTypes.plants}</option>
          <option value="reptiles">{activeContent.biodiversityTypes.reptiles}</option>
          <option value="amphibians">{activeContent.biodiversityTypes.amphibians}</option>
          <option value="fish">{activeContent.biodiversityTypes.fish}</option>
          <option value="other">{activeContent.biodiversityTypes.other}</option>
        </select>
      );
    } else if (formik.values.dataType === 'weather') {
      return (
        <select
          id="value"
          name="value"
          className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 w-full text-gray-900 dark:text-gray-100"
          onChange={formik.handleChange}
          value={formik.values.value}
        >
          <option value="">{activeContent.selectWeatherPlaceholder}</option>
          <option value="sunny">{activeContent.weatherConditions.sunny}</option>
          <option value="cloudy">{activeContent.weatherConditions.cloudy}</option>
          <option value="rainy">{activeContent.weatherConditions.rainy}</option>
          <option value="stormy">{activeContent.weatherConditions.stormy}</option>
          <option value="foggy">{activeContent.weatherConditions.foggy}</option>
          <option value="windy">{activeContent.weatherConditions.windy}</option>
          <option value="snowy">{activeContent.weatherConditions.snowy}</option>
          <option value="hot">{activeContent.weatherConditions.hot}</option>
          <option value="cold">{activeContent.weatherConditions.cold}</option>
        </select>
      );
    } else {
      return (
        <input
          type="text"
          id="value"
          name="value"
          className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 w-full text-gray-900 dark:text-gray-100"
          onChange={formik.handleChange}
          value={formik.values.value}
        />
      );
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    formik.setFieldValue('images', files);
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md p-6 border dark:border-gray-800 rounded-lg">
      <h2 className="mb-4 font-bold text-green-700 dark:text-green-400 text-2xl">{activeContent.title}</h2>

      {submitSuccess && (
        <div className="bg-green-100 dark:bg-green-900/30 mb-4 px-4 py-3 border border-green-400 dark:border-green-600 rounded text-green-700 dark:text-green-400">
          {activeContent.successMessage}
        </div>
      )}

      {submitError && (
        <div className="bg-red-100 dark:bg-red-900/30 mb-4 px-4 py-3 border border-red-400 dark:border-red-600 rounded text-red-700 dark:text-red-400">
          {submitError}
        </div>
      )}

      <form onSubmit={formik.handleSubmit}>
        <div className="mb-4">
          <label htmlFor="dataType" className="block mb-2 font-bold text-gray-700 dark:text-gray-300">
            {activeContent.dataTypeLabel}
          </label>
          <select
            id="dataType"
            name="dataType"
            className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 w-full text-gray-900 dark:text-gray-100"
            onChange={formik.handleChange}
            value={formik.values.dataType}
          >
            <option value="pollution">{activeContent.dataTypes.pollution}</option>
            <option value="biodiversity">{activeContent.dataTypes.biodiversity}</option>
            <option value="weather">{activeContent.dataTypes.weather}</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="value" className="block mb-2 font-bold text-gray-700 dark:text-gray-300">
            {getValueLabel()}
          </label>
          {renderValueInput()}
          {formik.touched.value && formik.errors.value && (
            <div className="mt-1 text-red-500 dark:text-red-400">{formik.errors.value as string}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="notes" className="block mb-2 font-bold text-gray-700 dark:text-gray-300">
            {activeContent.notesLabel}
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 w-full text-gray-900 dark:text-gray-100 resize-vertical"
            onChange={formik.handleChange}
            value={formik.values.notes}
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="images" className="block mb-2 font-bold text-gray-700 dark:text-gray-300">
            {activeContent.imagesLabel}
          </label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/*"
            className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 w-full text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900 dark:file:text-green-300 dark:hover:file:bg-green-800"
            onChange={handleImageChange}
          />
          {formik.values.images && formik.values.images.length > 0 && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {formik.values.images.length} file(s) selected
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold text-gray-700 dark:text-gray-300">{activeContent.locationLabel}</label>
          <div className="gap-4 grid grid-cols-2">
            <div>
              <label htmlFor="latitude" className="block mb-1 text-gray-700 dark:text-gray-400 text-sm">
                {activeContent.latitudeLabel}
              </label>
              <input
                type="text"
                id="latitude"
                name="latitude"
                className="bg-gray-50 dark:bg-gray-700 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 w-full text-gray-900 dark:text-gray-100"
                onChange={formik.handleChange}
                value={formik.values.latitude}
                readOnly
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block mb-1 text-gray-700 dark:text-gray-400 text-sm">
                {activeContent.longitudeLabel}
              </label>
              <input
                type="text"
                id="longitude"
                name="longitude"
                className="bg-gray-50 dark:bg-gray-700 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 w-full text-gray-900 dark:text-gray-100"
                onChange={formik.handleChange}
                value={formik.values.longitude}
                readOnly
              />
            </div>
          </div>
          {(!formik.values.latitude || !formik.values.longitude) && (
            
            !location && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                {activeContent.locationWaiting}
              </p>
            )
            
          )}
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:bg-green-700 dark:hover:bg-green-600 dark:disabled:bg-gray-600 px-4 py-2 rounded-lg w-full font-bold text-white transition-colors disabled:cursor-not-allowed"
          disabled={isSubmitting || !formik.values.latitude || !formik.values.longitude}
        >
          {isSubmitting ? activeContent.submittingButton : activeContent.submitButton}
        </button>
      </form>
    </div>
  );
};

export default DataForm;