'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Cannabis, Save, History } from 'lucide-react';
import { useConsumptionStore } from '@/store/consumption';
import {
  ConsumptionFormData,
  getQuantityConfig,
  createQuantityValue,
  getAccessoryConfig,
  VesselCategory,
  FlowerSize,
  SessionImage,
  FLOWER_SIZES
} from '@/types/consumption';
import { cn } from '@/lib/utils';
import { getLatestStrainAutofill } from '@/lib/strainAutofill';
import SuccessNotification from '@/components/ui/SuccessNotification';
import LocationSelector from '@/components/LocationSelector';
import ImageUpload from '@/components/ImageUpload';
import LastSessionModal from '@/components/LastSessionModal';
import WhoWithSelector from '@/components/WhoWithSelector';
import AccessorySelector from '@/components/AccessorySelector';
import VesselSelector from '@/components/VesselSelector';
import TobaccoSelector from '@/components/TobaccoSelector';
import StrainSelector from '@/components/StrainSelector';
import StrainTypeSelector from '@/components/StrainTypeSelector';

// Dynamic Quantity Input Component
interface QuantityInputProps {
  vesselCategory: VesselCategory;
  value: number | FlowerSize | '';
  onChange: (value: number | FlowerSize | '') => void;
  required?: boolean;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  vesselCategory,
  value,
  onChange,
  required = false
}) => {
  const config = getQuantityConfig(vesselCategory);

  if (config.type === 'size_category' && config.options) {
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
      value={typeof value === 'number' ? value : ''}
      onChange={(e) => {
        if (e.target.value === '') {
          onChange('');
          return;
        }
        onChange(parseFloat(e.target.value));
      }}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  );
};

const ConsumptionForm: React.FC = () => {
  const {
    currentSession,
    updateCurrentSession,
    addSession,
    updateSession,
    clearCurrentSession,
    isSaving,
    preferences,
    setActiveView,
    sessions
  } = useConsumptionStore();

  // Check if we're in edit mode (currentSession has an id)
  const editingSessionId = currentSession?.id as string | undefined;
  const isEditMode = !!editingSessionId;

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
    strain_type: '',
    thc_percentage: undefined,
    purchased_legally: true,
    state_purchased: '',
    tobacco: undefined,
    kief: false,
    concentrate: false,
    lavender: false,
    quantity: '',
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

  // Update form when currentSession changes (e.g., when editing a session)
  // Use a ref to track if we've already populated for this session ID
  const lastPopulatedSessionId = React.useRef<string | null>(null);
  
  useEffect(() => {
    const sessionId = (currentSession as { id?: string } | undefined)?.id;
    const currentLocationId = (currentSession as { location_ref?: { id?: string } } | undefined)?.location_ref?.id;
    
    // Only populate if we have a session ID and it's different from the last one we populated
    if (currentSession && sessionId && sessionId !== lastPopulatedSessionId.current) {
      lastPopulatedSessionId.current = sessionId;
      
      // Determine the correct quantity value
      // For size_category types, the stored quantity is an index that needs to be converted to FlowerSize string
      let quantityValue: number | FlowerSize | '' = currentSession.quantity ?? '';
      const vesselCategory = currentSession.vessel_category as VesselCategory;
      if (vesselCategory) {
        const quantityConfig = getQuantityConfig(vesselCategory);
        if (quantityConfig.type === 'size_category' && typeof quantityValue === 'number') {
          // Convert numeric index back to FlowerSize string
          quantityValue = FLOWER_SIZES[quantityValue] || 'medium';
        }
      }
      
      setFormData({
        date: currentSession.date || format(new Date(), 'yyyy-MM-dd'),
        time: currentSession.time || format(new Date(), 'HH:mm'),
        location: currentSession.location || '',
        latitude: currentSession.latitude,
        longitude: currentSession.longitude,
        who_with: currentSession.who_with || '',
        vessel_category: currentSession.vessel_category || '',
        vessel: currentSession.vessel || '',
        accessory_used: currentSession.accessory_used || 'N/A',
        my_vessel: currentSession.my_vessel ?? true,
        my_substance: currentSession.my_substance ?? true,
        strain_name: currentSession.strain_name || '',
        strain_type: currentSession.strain_type || '',
        thc_percentage: currentSession.thc_percentage ?? undefined,
        purchased_legally: currentSession.purchased_legally ?? true,
        state_purchased: currentSession.state_purchased || '',
        tobacco: currentSession.tobacco,
        kief: currentSession.kief ?? false,
        concentrate: currentSession.concentrate ?? false,
        lavender: currentSession.lavender ?? false,
        quantity: quantityValue,
        comments: currentSession.comments || '',
      });

      setSelectedLocationId(currentLocationId || null);
    }
    
    // Clear the ref when exiting edit mode
    if (!sessionId) {
      lastPopulatedSessionId.current = null;
      setSelectedLocationId(null);
    }
  }, [currentSession]);

  // Track if we've already done the initial pre-population of strain info
  // This prevents the strain from being reset when the user clears it
  const hasPrePopulatedStrain = React.useRef(false);

  // Pre-populate strain, THC, state_purchased, purchased_legally from most recent session
  // BUT only if we're not in edit mode AND we haven't already pre-populated
  useEffect(() => {
    const sessionId = (currentSession as { id?: string } | undefined)?.id;
    // Skip if we're editing an existing session
    if (sessionId) return;
    
    // Only pre-populate once per form lifecycle
    if (sessions.length > 0 && !hasPrePopulatedStrain.current) {
      hasPrePopulatedStrain.current = true;
      // Sessions are already sorted by created_at desc, so sessions[0] is most recent
      const recent = sessions[0];
      setFormData(prev => ({
        ...prev,
        strain_name: prev.strain_name || recent.strain_name || '',
        strain_type: prev.strain_type || recent.strain_type || '',
        thc_percentage: prev.thc_percentage ?? recent.thc_percentage ?? undefined,
        state_purchased: prev.state_purchased || recent.state_purchased || '',
        purchased_legally: recent.purchased_legally ?? true,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions.length, currentSession]); // Only run when sessions array length changes (initial load)

  const handleInputChange = (field: keyof ConsumptionFormData, value: string | number | boolean | FlowerSize | undefined) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Reset quantity and accessory to appropriate defaults when vessel category changes
      if (field === 'vessel_category') {
        const newCategory = value as VesselCategory;

        // Keep quantity blank when switching categories so user can enter/select it explicitly
        newData.quantity = '';
        
        // Reset accessory based on new category
        const newAccessoryConfig = getAccessoryConfig(newCategory);
        if (newAccessoryConfig.allowNA) {
          newData.accessory_used = 'N/A';
        } else {
          // If N/A not allowed, clear it so user must select
          newData.accessory_used = '';
        }
      }

      // Reset accessory when the specific vessel changes (different vessel may have different accessories)
      if (field === 'vessel') {
        const categoryConfig = getAccessoryConfig(prev.vessel_category as VesselCategory);
        if (categoryConfig.allowNA) {
          newData.accessory_used = 'N/A';
        } else {
          newData.accessory_used = '';
        }
      }

      // Re-populate known strain metadata from the most recent matching session.
      if (field === 'strain_name' && typeof value === 'string') {
        const autofill = getLatestStrainAutofill(value, sessions);
        if (autofill) {
          newData.strain_type = autofill.strain_type;
          newData.thc_percentage = autofill.thc_percentage;
          newData.purchased_legally = autofill.purchased_legally;
          newData.state_purchased = autofill.state_purchased;
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (formData.quantity === '') {
        alert('Please enter a quantity before saving.');
        return;
      }

      // Convert form data to session data with proper quantity format
      const sessionData = {
        ...formData,
        quantity: createQuantityValue(formData.vessel_category as VesselCategory, formData.quantity),
        // Include selected location ID if using existing location
        ...(selectedLocationId && { selectedLocationId })
      };
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/3931dac6-182e-4a91-bd6e-d62afaa24791',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ac4157'},body:JSON.stringify({sessionId:'ac4157',runId:'initial',hypothesisId:'H4',location:'src/components/ConsumptionForm.tsx:286',message:'Submit started with derived session data',data:{isEditMode,editingSessionId:selectedLocationId ? editingSessionId : editingSessionId,selectedLocationId,uploadedImagesCount:uploadedImages.length,uploadedImageSessionIds:uploadedImages.map((img)=>img.session_id)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      let savedSessionId: string | undefined;

      if (isEditMode && editingSessionId) {
        // Update existing session
        await updateSession(editingSessionId, sessionData);
        savedSessionId = editingSessionId;
      } else {
        // Create new session
        const newSession = await addSession(sessionData);
        savedSessionId = newSession?.id;
        
        // If we have uploaded images, link them to the new session
        if (uploadedImages.length > 0 && savedSessionId) {
          try {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/3931dac6-182e-4a91-bd6e-d62afaa24791',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ac4157'},body:JSON.stringify({sessionId:'ac4157',runId:'initial',hypothesisId:'H1',location:'src/components/ConsumptionForm.tsx:303',message:'Starting image link loop',data:{savedSessionId,uploadedImagesCount:uploadedImages.length,uploadedImageSessionIds:uploadedImages.map((img)=>img.session_id)},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            // Link all temporary images to the actual session
            for (const image of uploadedImages) {
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/3931dac6-182e-4a91-bd6e-d62afaa24791',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ac4157'},body:JSON.stringify({sessionId:'ac4157',runId:'initial',hypothesisId:'H1',location:'src/components/ConsumptionForm.tsx:307',message:'Evaluating uploaded image for temp-session linking',data:{imageId:image.id,imageSessionId:image.session_id,eligibleForLink:image.session_id.startsWith('temp_')},timestamp:Date.now()})}).catch(()=>{});
              // #endregion
              if (image.session_id.startsWith('temp_')) {
                const linkResponse = await fetch(`/api/images/upload?tempSessionId=${image.session_id}&actualSessionId=${savedSessionId}`, {
                  method: 'PATCH',
                });
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/3931dac6-182e-4a91-bd6e-d62afaa24791',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ac4157'},body:JSON.stringify({sessionId:'ac4157',runId:'initial',hypothesisId:'H1',location:'src/components/ConsumptionForm.tsx:312',message:'Image link API completed',data:{imageId:image.id,imageSessionId:image.session_id,status:linkResponse.status,ok:linkResponse.ok},timestamp:Date.now()})}).catch(()=>{});
                // #endregion
              }
            }
          } catch (error) {
            console.error('Failed to link images to session:', error);
            // Don't fail the session creation if image linking fails
          }
        }
      }

      // Show success notification with appropriate message
      setSuccessMessage(isEditMode ? "Session updated successfully!" : "Session logged successfully!");
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
          strain_type: formData.strain_type,
          thc_percentage: formData.thc_percentage ?? undefined,
          purchased_legally: formData.purchased_legally,
          state_purchased: formData.state_purchased,
          tobacco: undefined,
          kief: false,
          concentrate: false,
          lavender: false,
          quantity: '',
          comments: ''
        });

        clearCurrentSession();
        setSelectedLocationId(null);
        setUploadedImages([]);
        // Don't reset hasPrePopulatedStrain here since we're preserving the strain info
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
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Consumption Session' : 'Log Consumption Session'}
        </h1>
        {isEditMode ? (
          <button
            type="button"
            onClick={() => {
              clearCurrentSession();
              // Reset the pre-population ref so strain info can be pre-populated from recent session
              hasPrePopulatedStrain.current = false;
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
                strain_name: '',
                strain_type: '',
                thc_percentage: undefined,
                purchased_legally: true,
                state_purchased: '',
                tobacco: undefined,
                kief: false,
                concentrate: false,
                lavender: false,
                quantity: '',
                comments: ''
              });
            }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel Edit
          </button>
        ) : (
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
        )}
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
            locationId={selectedLocationId || undefined}
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
            vessel={formData.vessel}
            vesselCategory={formData.vessel_category as VesselCategory}
          />
        </div>

        {/* Ownership */}
        <div className="grid grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strain Name *
            </label>
            <StrainSelector
              value={formData.strain_name}
              onChange={(value) => handleInputChange('strain_name', value)}
              placeholder="Select or type strain name..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strain Type
            </label>
            <StrainTypeSelector
              value={formData.strain_type || ''}
              onChange={(value) => handleInputChange('strain_type', value)}
              placeholder="Select or type strain type..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              THC %
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.thc_percentage ?? ''}
              onChange={(e) => {
                if (e.target.value === '') {
                  handleInputChange('thc_percentage', undefined);
                  return;
                }

                const parsedValue = Number(e.target.value);
                handleInputChange(
                  'thc_percentage',
                  Number.isNaN(parsedValue) ? undefined : parsedValue
                );
              }}
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
            {getQuantityConfig(formData.vessel_category as VesselCategory).unit}
          </p>
        </div>

        {/* Additives */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additives
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tobacco Type
              </label>
              <TobaccoSelector
                value={formData.tobacco}
                onChange={(value) => handleInputChange('tobacco', value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
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
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.lavender}
                onChange={(e) => handleInputChange('lavender', e.target.checked)}
                className="mr-2"
              />
              Lavender
            </label>
          </div>
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
            "w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-medium rounded-md transition-colors",
            isEditMode ? "bg-blue-600" : "bg-green-600",
            isSaving
              ? "opacity-50 cursor-not-allowed"
              : isEditMode
                ? "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                : "hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          )}
        >
          <Save className="h-5 w-5" />
          {isSaving ? 'Saving...' : isEditMode ? 'Update Session' : 'Log Session'}
        </button>
      </form>

      {/* Success Notification */}
      {showSuccess && (
        <SuccessNotification
          message={successMessage}
          onComplete={handleSuccessComplete}
          duration={2000}
        />
      )}

      {/* Last Session Modal */}
      <LastSessionModal
        isOpen={showLastSession}
        onClose={() => setShowLastSession(false)}
        onApply={(session) => {
          // Convert QuantityValue to form quantity (number | FlowerSize)
          let quantityValue: number | FlowerSize | '' = '';
          if (session.quantity) {
            const vesselCategory = session.vessel_category as VesselCategory;
            const quantityConfig = vesselCategory ? getQuantityConfig(vesselCategory) : null;
            if (quantityConfig?.type === 'size_category') {
              // Convert numeric index back to FlowerSize string
              quantityValue = FLOWER_SIZES[session.quantity.amount] || 'medium';
            } else {
              quantityValue = session.quantity.amount;
            }
          }
          
          // Apply last session data to the form (including date/time for easier past entry logging)
          setFormData(prev => {
            const appliedFormData = {
              // Copy date and time from last session
              date: session.date || prev.date,
              time: session.time || prev.time,
              // Apply session data
              location: session.location || '',
              who_with: session.who_with || '',
              vessel_category: session.vessel_category || '',
              vessel: session.vessel || '',
              accessory_used: session.accessory_used || 'N/A',
              my_vessel: session.my_vessel ?? true,
              my_substance: session.my_substance ?? true,
              strain_name: session.strain_name || '',
              strain_type: session.strain_type || '',
              thc_percentage: session.thc_percentage ?? undefined,
              purchased_legally: session.purchased_legally ?? true,
              state_purchased: session.state_purchased || '',
              tobacco: session.tobacco || undefined,
              kief: session.kief ?? false,
              concentrate: session.concentrate ?? false,
              lavender: session.lavender ?? false,
              quantity: quantityValue,
              comment: '', // Don't copy the comment
              images: [], // Don't copy images
            };
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/3931dac6-182e-4a91-bd6e-d62afaa24791',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ac4157'},body:JSON.stringify({sessionId:'ac4157',runId:'initial',hypothesisId:'H2',location:'src/components/ConsumptionForm.tsx:843',message:'Applying last session values',data:{sessionId:session.id,hasCommentField:Object.prototype.hasOwnProperty.call(appliedFormData,'comment'),hasCommentsField:Object.prototype.hasOwnProperty.call(appliedFormData,'comments'),incomingComment:session.comments},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            return { ...prev, ...appliedFormData };
          });
          // Reset pre-population ref since we're manually applying values
          hasPrePopulatedStrain.current = true;
        }}
        session={sessions.length > 0 ? sessions[0] : null}
      />
    </div>
  );
};

export default ConsumptionForm;
