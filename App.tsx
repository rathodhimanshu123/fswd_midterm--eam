import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Gallery from './components/Gallery';
import Header from './components/Header';
import History from './components/History';
import { ImageData, SortOrder, HistoryEntry } from './types';
import './styles/gallery.css'; // Import custom CSS
import { v4 as uuidv4 } from 'uuid';

// Lazy load the UploadForm component
const UploadForm = lazy(() => import('./components/UploadForm'));

// Fallback component for lazy loading
const UploadFormFallback = () => (
  <div className="bg-white rounded-lg shadow-lg p-6 relative animate-fade-in">
    <div className="h-80 flex items-center justify-center">
      <div className="loading-spinner h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
    </div>
  </div>
);

// Sample data to show when backend is unavailable - using reliable image sources
const sampleImages: ImageData[] = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Mountain landscape',
    width: 800,
    height: 600,
    category: 'nature',
    tags: ['mountain', 'landscape'],
    description: 'Beautiful mountain landscape with a lake view',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Mountain river',
    width: 800,
    height: 600,
    category: 'nature',
    tags: ['river', 'mountain'],
    description: 'Clear mountain river flowing through rocks',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Forest landscape',
    width: 800,
    height: 600,
    category: 'nature',
    tags: ['forest', 'landscape'],
    description: 'Deep forest with morning light',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Modern building',
    width: 800,
    height: 600,
    category: 'architecture',
    tags: ['building', 'modern'],
    description: 'Modern glass building with geometric patterns',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
  },
  {
    id: '5',
    src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Skyscraper',
    width: 800,
    height: 600,
    category: 'architecture',
    tags: ['building', 'skyscraper'],
    description: 'Tall skyscraper viewed from below',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: '6',
    src: 'https://images.unsplash.com/photo-1593620659911-0da583be5150?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Dog portrait',
    width: 800,
    height: 600,
    category: 'animals',
    tags: ['dog', 'pet'],
    description: 'Cute dog portrait close-up',
    createdAt: new Date().toISOString(), // Today
  }
];

const App: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean>(true);
  const [uploadFormKey, setUploadFormKey] = useState<number>(0); // For forcing re-render
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [actionFeedback, setActionFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyActiveTab, setHistoryActiveTab] = useState<'viewHistory' | 'deleteHistory'>('viewHistory');

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('imageGalleryHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error('Failed to load history from localStorage:', err);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('imageGalleryHistory', JSON.stringify(history));
    } catch (err) {
      console.error('Failed to save history to localStorage:', err);
    }
  }, [history]);

  // Fetch images from the API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        try {
          const response = await fetch('/api/images', {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Add createdAt if missing
          const processedData = data.map((img: ImageData) => ({
            ...img,
            createdAt: img.createdAt || new Date().toISOString(), // Default to current time if missing
            isDeleted: img.isDeleted || false, // Default to not deleted if missing
          }));
          
          setImages(processedData);
          setBackendAvailable(true);
          setError(null);
        } catch (err) {
          console.error('Error fetching images:', err);
          
          // If backend is unavailable, use sample images
          if (err instanceof Error && (
            err.name === 'AbortError' || 
            err.message.includes('Failed to fetch') || 
            err.message.includes('NetworkError')
          )) {
            console.log('Backend unavailable, using sample data');
            setImages(sampleImages);
            setBackendAvailable(false);
            setError('Backend server is not available. Using sample data.');
          } else {
            setError('Failed to load images. Please try again later.');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Filter images based on category
  const filteredImages = filter === 'all' 
    ? images 
    : images.filter(image => image.category === filter);

  // Get unique categories for the filter
  const categories = ['all', ...Array.from(new Set(images.map(img => img.category)))];

  // Enhanced upload handling
  const handleShowUploadForm = useCallback(() => {
    setShowUploadForm(true);
    // Force component to re-render with a new key to reset its state
    setUploadFormKey(prev => prev + 1);
  }, []);

  const handleCloseUploadForm = useCallback(() => {
    // Animate the closing of the form
    setShowUploadForm(false);
  }, []);

  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+U shortcut to open upload form
      if (e.altKey && e.key === 'u') {
        handleShowUploadForm();
      }
      
      // Alt+T shortcut to toggle deleted images
      if (e.altKey && e.key === 't') {
        setShowDeleted(prev => !prev);
      }
      
      // Alt+H shortcut to toggle history
      if (e.altKey && e.key === 'h') {
        setShowHistory(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleShowUploadForm]);

  // Show feedback message
  const showFeedback = useCallback((message: string, type: 'success' | 'error') => {
    setActionFeedback({ message, type });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setActionFeedback(null);
    }, 3000);
  }, []);

  // Add to history
  const addToHistory = useCallback((image: ImageData, actionType: 'view' | 'delete' | 'restore') => {
    const entry: HistoryEntry = {
      id: uuidv4(),
      imageId: image.id,
      timestamp: new Date().toISOString(),
      actionType,
      imageData: { ...image }
    };
    
    setHistory(prev => [entry, ...prev].slice(0, 100)); // Limit to 100 entries
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    showFeedback('History cleared', 'success');
  }, [showFeedback]);

  // Toggle history panel
  const toggleHistory = useCallback(() => {
    setShowHistory(prev => !prev);
  }, []);

  // Handle image upload with improved error handling
  const handleImageUpload = useCallback(async (newImage: ImageData) => {
    // Add created date and non-deleted status
    const imageWithMeta = {
      ...newImage,
      createdAt: new Date().toISOString(),
      isDeleted: false
    };
    
    // Add the new image to the beginning of the array for better UX
    setImages(prevImages => [imageWithMeta, ...prevImages]);
    setShowUploadForm(false);
    
    // Reset filter to show the newly added image if we're on a different category
    if (filter !== 'all' && newImage.category !== filter) {
      setFilter('all');
    }
    
    // Show success feedback
    showFeedback('Image uploaded successfully!', 'success');
  }, [filter, showFeedback]);

  // Handle image deletion
  const handleImageDelete = useCallback(async (id: string) => {
    // Find the image to add to history
    const imageToDelete = images.find(img => img.id === id);
    
    // Soft delete - mark as deleted instead of removing
    setImages(prevImages => prevImages.map(img => 
      img.id === id ? { ...img, isDeleted: true } : img
    ));
    
    // Add to delete history if image was found
    if (imageToDelete) {
      addToHistory({ ...imageToDelete, isDeleted: true }, 'delete');
    }
    
    // Show feedback
    showFeedback('Image moved to trash', 'success');
    
    // If backend is available, send delete request
    if (backendAvailable) {
      try {
        const response = await fetch(`/api/images/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        console.error('Error deleting image:', err);
        // Only show error if it's not a connection issue
        if (!(err instanceof Error && (
          err.message.includes('Failed to fetch') || 
          err.message.includes('NetworkError')
        ))) {
          showFeedback('Failed to delete image on server, but deleted locally', 'error');
        }
      }
    }
  }, [backendAvailable, showFeedback, images, addToHistory]);

  // Handle image restoration
  const handleImageRestore = useCallback(async (id: string) => {
    // Find the image to add to history
    const imageToRestore = images.find(img => img.id === id);
    
    // Update local state
    setImages(prevImages => prevImages.map(img => 
      img.id === id ? { ...img, isDeleted: false } : img
    ));
    
    // Add to restore history if image was found
    if (imageToRestore) {
      addToHistory({ ...imageToRestore, isDeleted: false }, 'restore');
    }
    
    // Show feedback
    showFeedback('Image restored successfully!', 'success');
    
    // If backend is available, send restore request
    if (backendAvailable) {
      try {
        const response = await fetch(`/api/images/${id}/restore`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        console.error('Error restoring image:', err);
        // Only show error if it's not a connection issue
        if (!(err instanceof Error && (
          err.message.includes('Failed to fetch') || 
          err.message.includes('NetworkError')
        ))) {
          showFeedback('Failed to restore image on server, but restored locally', 'error');
        }
      }
    }
  }, [backendAvailable, showFeedback, images, addToHistory]);

  // Handle caption updates
  const handleCaptionUpdate = useCallback(async (id: string, caption: string) => {
    // Update local state
    setImages(prevImages => prevImages.map(img => 
      img.id === id ? { ...img, caption } : img
    ));
    
    // Show feedback
    showFeedback('Caption updated successfully!', 'success');
    
    // If backend is available, send caption update request
    if (backendAvailable) {
      try {
        const response = await fetch(`/api/images/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ caption })
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        console.error('Error updating caption:', err);
        // Only show error if it's not a connection issue
        if (!(err instanceof Error && (
          err.message.includes('Failed to fetch') || 
          err.message.includes('NetworkError')
        ))) {
          showFeedback('Failed to update caption on server, but updated locally', 'error');
        }
      }
    }
  }, [backendAvailable, showFeedback]);

  // Toggle showing deleted images
  const handleToggleDeleted = useCallback(() => {
    setShowDeleted(prev => !prev);
  }, []);

  // Handle sort order change
  const handleSortChange = useCallback((newSortOrder: SortOrder) => {
    setSortOrder(newSortOrder);
  }, []);

  // Handle history view image
  const handleHistoryViewImage = useCallback((image: ImageData) => {
    // Find the current version of the image in our state
    const currentImage = images.find(img => img.id === image.id);
    
    // If found, select it; otherwise use the history version
    if (currentImage) {
      // Find this image in the actual images and add it to history
      const targetIndex = images.findIndex(img => img.id === image.id);
      if (targetIndex !== -1) {
        // Add to view history
        addToHistory(images[targetIndex], 'view');
      }
    } else {
      // Image no longer exists in our state, just add the history version to history
      addToHistory(image, 'view');
    }
    
    // If we're in delete history and the image was deleted, make sure we're showing deleted images
    if (historyActiveTab === 'deleteHistory' && image.isDeleted && !showDeleted) {
      setShowDeleted(true);
      showFeedback('Showing deleted images to view selected image', 'success');
    }
  }, [images, addToHistory, historyActiveTab, showDeleted, showFeedback]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark-mode-support">
      <Header 
        categories={categories} 
        activeFilter={filter} 
        onFilterChange={setFilter}
        onUploadClick={handleShowUploadForm}
        onToggleDeleted={handleToggleDeleted}
        showDeleted={showDeleted}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onToggleHistory={toggleHistory}
        showHistory={showHistory}
      />
      
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded shadow-soft animate-fadeIn" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {/* Feedback Toast */}
        {actionFeedback && (
          <div 
            className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-medium animate-slideIn ${
              actionFeedback.type === 'success' 
                ? 'bg-green-100 border-l-4 border-green-500 text-green-700' 
                : 'bg-red-100 border-l-4 border-red-500 text-red-700'
            }`}
            role="alert"
          >
            <div className="flex items-center">
              <div className="mr-3">
                {actionFeedback.type === 'success' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <p>{actionFeedback.message}</p>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Main content area */}
            <div className={`flex-grow ${showHistory ? 'md:w-2/3' : 'w-full'}`}>
              {showUploadForm && (
                <div className="mb-8 relative">
                  <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40" onClick={handleCloseUploadForm}></div>
                  <div className="relative z-50 max-w-2xl mx-auto upload-form-container">
                    <Suspense fallback={<UploadFormFallback />}>
                      <UploadForm 
                        key={uploadFormKey}
                        onSuccess={handleImageUpload} 
                        onCancel={handleCloseUploadForm}
                      />
                    </Suspense>
                  </div>
                </div>
              )}
              
              {filteredImages.length === 0 ? (
                <div className="text-center text-gray-500 py-12 glass-effect rounded-lg p-10 shadow-medium animate-fadeIn">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg">
                    {showDeleted 
                      ? 'No deleted images found in this category.' 
                      : 'No images found in this category. Upload some images or try a different filter.'}
                  </p>
                  <button 
                    onClick={showDeleted ? handleToggleDeleted : handleShowUploadForm}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 btn-primary shadow-medium"
                  >
                    {showDeleted ? 'Show All Images' : 'Upload New Image'}
                  </button>
                </div>
              ) : (
                <Gallery 
                  images={filteredImages}
                  onDelete={handleImageDelete}
                  onRestore={handleImageRestore}
                  onSetCaption={handleCaptionUpdate}
                  showDeleted={showDeleted}
                  sortOrder={sortOrder}
                  onAddToHistory={(image, actionType) => addToHistory(image, actionType)}
                />
              )}
            </div>
            
            {/* History sidebar */}
            {showHistory && (
              <div className="md:w-1/3 flex-shrink-0 animate-slideInFromRight">
                <History
                  history={history}
                  onClearHistory={clearHistory}
                  onRestoreImage={handleImageRestore}
                  onViewImage={handleHistoryViewImage}
                  activeTab={historyActiveTab}
                  onTabChange={setHistoryActiveTab}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Floating upload button for mobile */}
      <button 
        onClick={handleShowUploadForm}
        className="fixed bottom-6 right-6 z-30 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:hidden fab"
        aria-label="Upload image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      
      {/* Floating history button for mobile */}
      <button 
        onClick={toggleHistory}
        className="fixed bottom-6 left-6 z-30 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:hidden fab"
        aria-label="Toggle history"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      {/* Keyboard shortcut hint */}
      {!showUploadForm && (
        <div className="fixed bottom-4 left-4 glass-effect rounded-lg p-2 text-xs text-gray-600 hidden md:block shadow-soft no-print">
          <div>Press <kbd>Alt</kbd>+<kbd>U</kbd> to upload</div>
          <div className="mt-1">Press <kbd>Alt</kbd>+<kbd>T</kbd> to toggle trash</div>
          <div className="mt-1">Press <kbd>Alt</kbd>+<kbd>H</kbd> to toggle history</div>
        </div>
      )}
    </div>
  );
};

export default App; 