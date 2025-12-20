'use client';

import React from 'react';
import { format } from 'date-fns';
import { X, MapPin, Clock, Calendar, Cannabis } from 'lucide-react';
import { ConsumptionSession, formatQuantity } from '@/types/consumption';

interface LastSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ConsumptionSession | null;
}

export default function LastSessionModal({ isOpen, onClose, session }: LastSessionModalProps) {
  if (!isOpen || !session) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Cannabis className="w-5 h-5 text-green-600" />
            Last Session
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Strain & THC */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {session.strain_name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <span className="capitalize">{session.vessel}</span>
              <span>•</span>
              <span>{formatQuantity(session.quantity)}</span>
              {session.thc_percentage && (
                <>
                  <span>•</span>
                  <span>THC: {session.thc_percentage}%</span>
                </>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(session.date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(`2000-01-01T${session.time}`), 'h:mm a')}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{session.location}</span>
          </div>

          {/* Who With */}
          {session.who_with && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">With: </span>
              <span className="text-gray-600">{session.who_with}</span>
            </div>
          )}

          {/* Accessory */}
          {session.accessory_used && session.accessory_used !== 'None' && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Accessory: </span>
              <span className="text-gray-600">{session.accessory_used}</span>
            </div>
          )}

          {/* Additives & Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {session.tobacco && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Tobacco
              </span>
            )}
            {session.kief && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Kief
              </span>
            )}
            {session.concentrate && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Concentrate
              </span>
            )}
            {!session.my_vessel && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Shared vessel
              </span>
            )}
            {!session.my_substance && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Shared substance
              </span>
            )}
            {session.purchased_legally ? (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                Legal purchase
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                Non-legal
              </span>
            )}
          </div>

          {/* State Purchased */}
          {session.purchased_legally && session.state_purchased && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Purchased in: </span>
              <span className="text-gray-600">{session.state_purchased}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
