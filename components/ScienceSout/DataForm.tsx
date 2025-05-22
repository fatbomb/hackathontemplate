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
        pollution: "Pollution Level (1-10)",
        biodiversity: "Species Observed",
        weather: "Weather Conditions"
      },
      notesLabel: "Additional Notes",
      locationLabel: "Location",
      latitudeLabel: "Latitude",
      longitudeLabel: "Longitude",
      locationWaiting: "Waiting for location... Please enable location services.",
      submitButton: "Submit Data",
      submittingButton: "Submitting...",
      requiredError: "Required"
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
        pollution: "দূষণের মাত্রা (১-১০)",
        biodiversity: "পর্যবেক্ষিত প্রজাতি",
        weather: "আবহাওয়ার অবস্থা"
      },
      notesLabel: "অতিরিক্ত মন্তব্য",
      locationLabel: "অবস্থান",
      latitudeLabel: "অক্ষাংশ",
      longitudeLabel: "দ্রাঘিমাংশ",
      locationWaiting: "অবস্থানের জন্য অপেক্ষা করা হচ্ছে... দয়া করে অবস্থান সেবা সক্ষম করুন।",
      submitButton: "তথ্য জমা দিন",
      submittingButton: "জমা দেওয়া হচ্ছে...",
      requiredError: "প্রয়োজনীয়"
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
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      dataType: 'pollution',
      value: '',
      notes: '',
      latitude: location?.lat || '',
      longitude: location?.lng || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      
      try {
        await axios.post('/api/environment/submit-data', {
          ...values,
          latitude: Number(values.latitude),
          longitude: Number(values.longitude),
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-green-700">{activeContent.title}</h2>
      
      {submitSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {activeContent.successMessage}
        </div>
      )}

      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {submitError}
        </div>
      )}

      <form onSubmit={formik.handleSubmit}>
        <div className="mb-4">
          <label htmlFor="dataType" className="block text-gray-700 font-bold mb-2">
            {activeContent.dataTypeLabel}
          </label>
          <select
            id="dataType"
            name="dataType"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={formik.handleChange}
            value={formik.values.dataType}
          >
            <option value="pollution">{activeContent.dataTypes.pollution}</option>
            <option value="biodiversity">{activeContent.dataTypes.biodiversity}</option>
            <option value="weather">{activeContent.dataTypes.weather}</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="value" className="block text-gray-700 font-bold mb-2">
            {getValueLabel()}
          </label>
          <input
            type="text"
            id="value"
            name="value"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={formik.handleChange}
            value={formik.values.value}
          />
          {formik.touched.value && formik.errors.value && (
            <div className="text-red-500 mt-1">{formik.errors.value as string}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="notes" className="block text-gray-700 font-bold mb-2">
            {activeContent.notesLabel}
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={formik.handleChange}
            value={formik.values.notes}
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">{activeContent.locationLabel}</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-gray-700 text-sm mb-1">
                {activeContent.latitudeLabel}
              </label>
              <input
                type="text"
                id="latitude"
                name="latitude"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={formik.handleChange}
                value={formik.values.latitude}
                readOnly
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-gray-700 text-sm mb-1">
                {activeContent.longitudeLabel}
              </label>
              <input
                type="text"
                id="longitude"
                name="longitude"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={formik.handleChange}
                value={formik.values.longitude}
                readOnly
              />
            </div>
          </div>
          {(!formik.values.latitude || !formik.values.longitude) && (
            <div className="text-yellow-600 mt-1">
              {activeContent.locationWaiting}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full disabled:bg-gray-400"
          disabled={isSubmitting || !formik.values.latitude || !formik.values.longitude}
        >
          {isSubmitting ? activeContent.submittingButton : activeContent.submitButton}
        </button>
      </form>
    </div>
  );
};

export default DataForm;