'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Cannabis, Save } from 'lucide-react';
import { useConsumptionStore } from '@/store/consumption';
import {
  ConsumptionFormData,
  VESSEL_TYPES,
  ACCESSORY_TYPES,
  getQuantityConfig,
  createQuantityValue,
  VesselType,
  FlowerSize
} from '@/types/consumption';
import { cn } from '@/lib/utils';
import SuccessNotification from '@/components/ui/SuccessNotification';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import InteractiveLocationMap from '@/components/InteractiveLocationMap';

// Dynamic Quantity Input Component
interface QuantityInputProps {
  vessel: VesselType;
  value: number | FlowerSize;
  onChange: (value: number | FlowerSize) => void;
  required?: boolean;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  vessel,
  value,
  onChange,
  required = false
}) => {
  const config = getQuantityConfig(vessel);

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
    setActiveView
  } = useConsumptionStore();

  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize form with default values
  const [formData, setFormData] = useState<ConsumptionFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    location: preferences.defaultLocation || '',
    who_with: '',
    vessel: 'Joint',
    accessory_used: 'None',
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
    quantity: 0.25, // Default for joint
    ...currentSession
  });

  // Update store when form data changes
  useEffect(() => {
    updateCurrentSession(formData);
  }, [formData, updateCurrentSession]);

  const handleInputChange = (field: keyof ConsumptionFormData, value: string | number | boolean | FlowerSize | undefined) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Reset quantity to appropriate default when vessel changes
      if (field === 'vessel') {
        const newConfig = getQuantityConfig(value as VesselType);
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
        quantity: createQuantityValue(formData.vessel as VesselType, formData.quantity)
      };

      await addSession(sessionData);

      // Show success notification
      setShowSuccess(true);

      // Reset form after a short delay
      setTimeout(() => {
        const defaultQuantity = getQuantityConfig('Joint').type === 'decimal' ? 0.25 : 0;
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm'),
          location: preferences.defaultLocation || '',
          who_with: '',
          vessel: 'Joint',
          accessory_used: 'None',
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
          quantity: defaultQuantity
        });

        clearCurrentSession();
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Cannabis className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Log Consumption Session</h1>
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
          <LocationAutocomplete
            value={formData.location}
            onLocationSelect={(location, coordinates) => {
              handleInputChange('location', location);
              if (coordinates) {
                handleInputChange('latitude', coordinates.lat);
                handleInputChange('longitude', coordinates.lng);
              }
            }}
            placeholder="Start typing an address or place name..."
            required
          />
        </div>

        {/* Interactive Map */}
        {(formData.latitude && formData.longitude) && (
          <InteractiveLocationMap
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationChange={(lat, lng) => {
              handleInputChange('latitude', lat);
              handleInputChange('longitude', lng);
            }}
            className="mt-4"
            height="250px"
          />
        )}



        {/* Who With */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Who With
          </label>
          <input
            type="text"
            placeholder="e.g., Solo, Friends, Partner (leave blank if alone)"
            value={formData.who_with}
            onChange={(e) => handleInputChange('who_with', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Vessel and Accessory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vessel *
            </label>
            <select
              required
              value={formData.vessel}
              onChange={(e) => handleInputChange('vessel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {VESSEL_TYPES.map(vessel => (
                <option key={vessel} value={vessel}>
                  {vessel}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accessory Used
            </label>
            <select
              value={formData.accessory_used}
              onChange={(e) => handleInputChange('accessory_used', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {ACCESSORY_TYPES.map(accessory => (
                <option key={accessory} value={accessory}>
                  {accessory}
                </option>
              ))}
            </select>
          </div>
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
            vessel={formData.vessel as VesselType}
            value={formData.quantity}
            onChange={(value) => handleInputChange('quantity', value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {getQuantityConfig(formData.vessel as VesselType).unit}
          </p>
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
    </div>
  );
};

export default ConsumptionForm;
