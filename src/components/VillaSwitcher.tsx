import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface VillaSwitcherProps {
  variant?: 'default' | 'mobile' | 'compact';
  className?: string;
}

export function VillaSwitcher({ variant = 'default', className = '' }: VillaSwitcherProps) {
  const { villas, selectedVilla, selectVilla } = useApp();

  if (villas.length === 0) {
    return null;
  }

  const handleVillaChange = (villaId: string) => {
    const villa = villas.find(v => v.id === villaId);
    if (villa) {
      selectVilla(villa);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <Select
          value={selectedVilla?.id || villas[0]?.id}
          onValueChange={handleVillaChange}
        >
          <SelectTrigger className="h-9 border-gray-300 focus:ring-[#7B5FEB] focus:border-[#7B5FEB] text-sm">
            <SelectValue placeholder="Select villa" />
          </SelectTrigger>
          <SelectContent>
            {villas.map((villa) => (
              <SelectItem key={villa.id} value={villa.id}>
                {villa.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`bg-white border-b border-gray-200 px-4 py-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] rounded-lg flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-sm text-gray-500 block mb-1">Active Villa</label>
            <Select
              value={selectedVilla?.id || villas[0]?.id}
              onValueChange={handleVillaChange}
            >
              <SelectTrigger className="h-10 border-gray-200 bg-gray-50 focus:ring-[#7B5FEB] focus:border-[#7B5FEB] text-sm font-medium">
                <SelectValue placeholder="Select a villa" />
              </SelectTrigger>
              <SelectContent>
                {villas.map((villa) => (
                  <SelectItem key={villa.id} value={villa.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{villa.name}</span>
                      {villa.address && (
                        <span className="text-sm text-gray-500">{villa.address}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {selectedVilla && villas.length > 1 && (
          <div className="mt-2 text-sm text-gray-500">
            {villas.length} villa{villas.length !== 1 ? 's' : ''} available
          </div>
        )}
      </div>
    );
  }

  // Default desktop variant
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-5 h-5 text-[#7B5FEB]" />
        <h3 className="font-semibold text-gray-900">Active Villa</h3>
      </div>
      <Select
        value={selectedVilla?.id || villas[0]?.id}
        onValueChange={handleVillaChange}
      >
        <SelectTrigger className="w-full h-11 border-gray-300 focus:ring-[#7B5FEB] focus:border-[#7B5FEB]">
          <SelectValue placeholder="Select a villa" />
        </SelectTrigger>
        <SelectContent>
          {villas.map((villa) => (
            <SelectItem key={villa.id} value={villa.id}>
              <div className="flex flex-col py-1">
                <span className="font-medium text-gray-900">{villa.name}</span>
                {villa.address && (
                  <span className="text-sm text-gray-500">{villa.address}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {villas.length > 1 && (
        <p className="text-sm text-gray-500 mt-2">
          Viewing data for {selectedVilla?.name || villas[0]?.name}
        </p>
      )}
    </div>
  );
}
