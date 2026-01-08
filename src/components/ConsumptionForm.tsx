'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Cannabis, Save, History } from 'lucide-react';
import { useConsumptionStore } from '@/store/consumption';
import {
  ConsumptionFormData,
  VESSEL_CATEGORIES,
  getQuantityConfig,
  createQuantityValue,
  VesselCategory,
  FlowerSize,
  SessionImage
} from '@/types/consumption';
import { cn } from '@/lib/utils';
import SuccessNotification from '@/components/ui/SuccessNotification';
import LocationSelector from '@/components/LocationSelector';
import ImageUpload from '@/components/ImageUpload';
import LastSessionModal from '@/components/LastSessionModal';
import WhoWithSelector from '@/components/WhoWithSelector';
import AccessorySelector from '@/components/AccessorySelector';
import VesselSelector from '@/components/VesselSelector';

// Dynamic Quantity Input Component
interface QuantityInputProps {
  vesselCategory: VesselCategory;
  value: number | FlowerSize;
  onChange: (value: number | FlowerSize) => void;
  required?: boolean;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  vesselCategory,
  value,
  onChange,
  required = false
}) => {
  const config = getQuantityConfig(vesselCategory);

  if (config.type === 'size_category' && 'options' in config) {
    return (
      <select
        required={required}
        value={value as string}
        onChange={(e) => onChange(e.target.value as FlowerSize)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">Select {config.unit}</option>
        {config.options.map((size) => (
          <option key={size} value={size}>
            {size.charAt(0).toUpperCase() + size.slice(1)} {config.unit}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="number"
      step={'step' in config ? config.step : 0.1}
      min="0"
      required={required}
      placeholder={'placeholder' in config ? config.placeholder : '0'}
      value={value as number}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  );
};

const ConsumptionForm: React.FC = () => {
  const {
    currentSession,
    updateCurrentSession,
    addSession,
    clearCurrentSession,
    isSaving,
    preferences,
    setActiveView,
    sessions
  } = useConsumptionStore();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showLastSession, setShowLastSession] = useState(false);

  // Initialize form with default values
  const [formData, setFormData] = useState<ConsumptionFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    location: preferences.defaultLocation || '',
    who_with: '',
    vessel_category: '',
    vessel: '',
    accessory_used: 'N/A',
    my_vessel: true,
    my_substance: true,
    strain_name: '',
    thc_percentage: 0,
    purchased_legally: true,
    state_purchased: '',
    tobacco: false,
    kief: false,
    concentrate: false,
    lavender: false,
    quantity: 1,
    comments: '',
    ...currentSession
  });

  // Track selected location ID for existing locations
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  // Track uploaded images for the current session
  const [uploadedImages, setUploadedImages] = useState<SessionImage[]>([]);

  // Update store when form data changes
  useEffect(() => {
    updateCurrentSession(formData);
  }, [formData, updateCurrentSession]);

  // Pre-populate strain, THC, state_purchased, purchased_legally from most recent session
  useEffect(() => {
    if (sessions.length > 0 && !formData.strain_name) {
      // Sessions are already sorted by created_at desc, so sessions[0] is most recent
      const recent = sessions[0];
      setFormData(prev => ({
        ...prev,
        strain_name: prev.strain_name || recent.strain_name || '',
        thc_percentage: prev.thc_percentage || recent.thc_percentage || 0,
        state_purchased: prev.state_purchased || recent.state_purchased || '',
        purchased_legally: recent.purchased_legally ?? true,
      }));
    }
  }, [sessions.length]); // Only run when sessions array length changes (initial load)

  const handleInputChange = (field: keyof ConsumptionFormData, value: string | number | boolean | FlowerSize | undefined) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Reset quantity to appropriate default when vessel category changes
      if (field === 'vessel_category') {
        const newCategory = value as VesselCategory;
        const newConfig = getQuantityConfig(newCategory);
        newData.quantity = newConfig.type === 'decimal'
          ? ('placeholder' in newConfig ? parseFloat(newConfig.placeholder) : 0)
          : ('options' in newConfig && newConfig.options ? newConfig.options[0] : 0);
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Convert form data to session data with proper quantity format
      const sessionData = {
        ...formData,
        quantity: createQuantityValue(formData.vessel_category as VesselCategory, formData.quantity),
        // Include selected location ID if using existing location
        ...(selectedLocationId && { selectedLocationId })
      };

      const newSession = await addSession(sessionData);
      
      // If we have uploaded images, link them to the new session
      if (uploadedImages.length > 0 && newSession?.id) {
        try {
          // Link all temporary images to the actual session
          for (const image of uploadedImages) {
            if (image.session_id.startsWith('temp_')) {
              await fetch(`/api/images/upload?tempSessionId=${image.session_id}&actualSessionId=${newSession.id}`, {
                method: 'PATCH',
              });
            }
          }
        } catch (error) {
          console.error('Failed to link images to session:', error);
          // Don't fail the session creation if image linking fails
        }
      }

      // Show success notification
      setShowSuccess(true);

      // Reset form after a short delay, preserving strain/THC/purchase info from the session we just created
      setTimeout(() => {
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm'),
          location: preferences.defaultLocation || '',
          who_with: '',
          vessel_category: '',
          vessel: '',
          accessory_used: 'N/A',
          my_vessel: true,
          my_substance: true,
          // Preserve these from the session we just submitted
          strain_name: formData.strain_name,
          thc_percentage: formData.thc_percentage,
          purchased_legally: formData.purchased_legally,
          state_purchased: formData.state_purchased,
          tobacco: false,
          kief: false,
          concentrate: false,
          lavender: false,
          quantity: 1,
          comments: ''
        });

        clearCurrentSession();
        setSelectedLocationId(null);
        setUploadedImages([]);
      }, 500);

    } catch (error) {
      console.error('Failed to save session:', error);
      alert('Failed to save session. Please try again.');
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    // Navigate to history view to show the newly created session
    setActiveView('history');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Cannabis className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Log Consumption Session</h1>
        <button
          type="button"
          onClick={() => setShowLastSession(true)}
          disabled={sessions.length === 0}
          className={cn(
            "ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            sessions.length === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          )}
        >
          <History className="h-4 w-4" />
          Last Session
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4" />
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4" />
              Time *
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4" />
            Location *
          </label>
          <LocationSelector
            value={formData.location}
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationSelect={(location, coordinates, locationId) => {
              handleInputChange('location', location);
              setSelectedLocationId(locationId || null);
              if (coordinates) {
                handleInputChange('latitude', coordinates.lat);
                handleInputChange('longitude', coordinates.lng);
              }
            }}
            required
          />
        </div>



        {/* Who With */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Who With
          </label>
          <WhoWithSelector
            value={formData.who_with}
            onChange={(value) => handleInputChange('who_with', value)}
            placeholder="Select or type a name (leave blank if alone)"
          />
        </div>

        {/* Vessel Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vessel *
          </label>
          <VesselSelector
            category={formData.vessel_category}
            vessel={formData.vessel}
            onCategoryChange={(cat) => handleInputChange('vessel_category', cat)}
            onVesselChange={(v) => handleInputChange('vessel', v)}
          />
        </div>

        {/* Accessory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accessory Used
          </label>
          <AccessorySelector
            value={formData.accessory_used}
            onChange={(value) => handleInputChange('accessory_used', value)}
            placeholder="Select accessory..."
          />
        </div>

        {/* Ownership */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              My Vessel
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="my_vessel"
                  checked={formData.my_vessel}
                  onChange={() => handleInputChange('my_vessel', true)}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="my_vessel"
                  checked={!formData.my_vessel}
                  onChange={() => handleInputChange('my_vessel', false)}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              My Substance
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="my_substance"
                  checked={formData.my_substance}
                  onChange={() => handleInputChange('my_substance', true)}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="my_substance"
                  checked={!formData.my_substance}
                  onChange={() => handleInputChange('my_substance', false)}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
        </div>

        {/* Strain Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strain Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Blue Dream"
              value={formData.strain_name}
              onChange={(e) => handleInputChange('strain_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              THC %
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.thc_percentage || ''}
              onChange={(e) => handleInputChange('thc_percentage', parseFloat(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Legal Purchase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchased Legally
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="purchased_legally"
                  checked={formData.purchased_legally}
                  onChange={() => handleInputChange('purchased_legally', true)}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="purchased_legally"
                  checked={!formData.purchased_legally}
                  onChange={() => handleInputChange('purchased_legally', false)}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
          {formData.purchased_legally && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State Purchased
              </label>
              <input
                type="text"
                placeholder="e.g., California"
                value={formData.state_purchased || ''}
                onChange={(e) => handleInputChange('state_purchased', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
        </div>

        {/* Additives */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additives
          </label>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.tobacco}
                onChange={(e) => handleInputChange('tobacco', e.target.checked)}
                className="mr-2"
              />
              Tobacco
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.kief}
                onChange={(e) => handleInputChange('kief', e.target.checked)}
                className="mr-2"
              />
              Kief
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.concentrate}
                onChange={(e) => handleInputChange('concentrate', e.target.checked)}
                className="mr-2"
              />
              Concentrate
            </label>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity *
          </label>
          <QuantityInput
            vesselCategory={formData.vessel_category as VesselCategory}
            value={formData.quantity}
            onChange={(value) => handleInputChange('quantity', value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {getQuantityConfig(formData.vessel as VesselType).unit}
          </p>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments
          </label>
          <textarea
            value={formData.comments || ''}
            onChange={(e) => handleInputChange('comments', e.target.value)}
            placeholder="Add any notes about this session..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Images
          </label>
          <ImageUpload
            sessionId={`temp_${Date.now()}`}
            onImageUploaded={(image) => {
              // Add image to the current session's image list
              setUploadedImages(prev => [...prev, image]);
            }}
            onImageDeleted={(imageId) => {
              // Remove image from the current session's image list
              setUploadedImages(prev => prev.filter(img => img.id !== imageId));
            }}
            existingImages={uploadedImages}
            maxImages={5}
            className="mt-2"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-md transition-colors",
            isSaving
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          )}
        >
          <Save className="h-5 w-5" />
          {isSaving ? 'Saving...' : 'Log Session'}
        </button>
      </form>

      {/* Success Notification */}
      {showSuccess && (
        <SuccessNotification
          message="Session logged successfully!"
          onComplete={handleSuccessComplete}
          duration={2000}
        />
      )}

      {/* Last Session Modal */}
      <LastSessionModal
        isOpen={showLastSession}
        onClose={() => setShowLastSession(false)}
        session={sessions.length > 0 ? sessions[0] : null}
      />
    </div>
  );
};

export default ConsumptionForm;
