import React from 'react';
import { DietType, UserPreferences } from '../types';
import { Check, AlertTriangle } from 'lucide-react';

interface Props {
  preferences: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
}

const COMMON_ALLERGENS = [
  "Peanuts", "Tree Nuts", "Milk", "Eggs", "Soy", "Wheat/Gluten", "Fish", "Shellfish", "Sesame"
];

const PreferenceSelector: React.FC<Props> = ({ preferences, onUpdate }) => {
  
  const toggleAllergy = (allergen: string) => {
    const newAllergies = preferences.allergies.includes(allergen)
      ? preferences.allergies.filter(a => a !== allergen)
      : [...preferences.allergies, allergen];
    onUpdate({ ...preferences, allergies: newAllergies });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg text-sm">1</span>
          Dietary Goal
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.values(DietType).map((diet) => (
            <button
              key={diet}
              onClick={() => onUpdate({ ...preferences, diet })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                preferences.diet === diet
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {diet}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="bg-rose-100 text-rose-600 p-1.5 rounded-lg text-sm">2</span>
          Allergies & Intolerances
        </h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGENS.map((allergen) => {
            const isSelected = preferences.allergies.includes(allergen);
            return (
              <button
                key={allergen}
                onClick={() => toggleAllergy(allergen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all border ${
                  isSelected
                    ? 'bg-rose-50 border-rose-200 text-rose-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {isSelected && <Check size={14} />}
                {allergen}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="bg-amber-100 text-amber-600 p-1.5 rounded-lg text-sm">3</span>
          Specific Avoidances
        </h3>
        <input
          type="text"
          value={preferences.customAvoidances}
          onChange={(e) => onUpdate({ ...preferences, customAvoidances: e.target.value })}
          placeholder="e.g. Red dye 40, Palm Oil, High Fructose Corn Syrup"
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
        />
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <AlertTriangle size={12} />
          Separate multiple items with commas
        </p>
      </div>
    </div>
  );
};

export default PreferenceSelector;
