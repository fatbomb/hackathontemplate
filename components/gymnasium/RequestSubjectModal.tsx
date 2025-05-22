// components/gymnasium/RequestSubjectModal.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RequestSubjectModalProps {
  userId: string;
}

export default function RequestSubjectModal({ userId }: RequestSubjectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setSubjectName('');
    setDescription('');
    setMessage({ text: '', type: '' });
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ text: 'Subject request submitted successfully!', type: 'success' });
      
      // Clear form after successful submission
      setSubjectName('');
      setDescription('');
      
      // Optionally close the modal after a delay
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (error) {
      setMessage({ text: 'Failed to submit request. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Request Subject Card */}
      <motion.div 
        onClick={openModal}
        className="flex flex-col justify-center items-center bg-card hover:bg-accent/10 shadow-sm hover:shadow-md p-8 border hover:border-primary/30 border-border/40 border-dashed rounded-xl text-center transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex justify-center items-center bg-primary/10 mb-4 rounded-full w-16 h-16 text-primary">
          <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="mb-1 font-semibold text-foreground text-lg">Request New Subject</h3>
        <p className="text-muted-foreground text-sm">
          Don't see what you're looking for? Request a new subject.
        </p>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="z-50 fixed inset-0 flex justify-center items-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              ref={modalRef}
              className="relative bg-card shadow-lg border border-border rounded-xl w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h3 className="font-semibold text-foreground text-xl">Request New Subject</h3>
                <button 
                  onClick={closeModal}
                  className="p-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                {message.text && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 mb-4 rounded-md ${
                      message.type === 'success' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {message.text}
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="subjectName" className="block font-medium text-foreground text-sm">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      id="subjectName"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      placeholder="Enter subject name"
                      className="bg-background px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="block font-medium text-foreground text-sm">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Explain why this subject would be valuable"
                      rows={4}
                      className="bg-background px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full resize-none"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="bg-background hover:bg-accent px-4 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-medium text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90 disabled:opacity-70 px-4 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-medium text-primary-foreground text-sm transition-colors disabled:pointer-events-none"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="mr-2 -ml-1 w-4 h-4 text-primary-foreground animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}