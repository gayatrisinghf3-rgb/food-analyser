import React from 'react';
import { AnalysisResult, SafetyStatus } from '../types';
import { ShieldCheck, ShieldAlert, ShieldX, FlaskConical, AlertCircle, Info } from 'lucide-react';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

const ResultsView: React.FC<Props> = ({ result, onReset }) => {
  
  const getStatusConfig = (status: SafetyStatus) => {
    switch (status) {
      case SafetyStatus.SAFE:
        return { color: 'emerald', icon: <ShieldCheck className="w-12 h-12" />, label: 'Safe to Consume' };
      case SafetyStatus.CAUTION:
        return { color: 'amber', icon: <ShieldAlert className="w-12 h-12" />, label: 'Consume with Caution' };
      case SafetyStatus.UNSAFE:
        return { color: 'rose', icon: <ShieldX className="w-12 h-12" />, label: 'Not Safe for You' };
      default:
        return { color: 'slate', icon: <AlertCircle className="w-12 h-12" />, label: 'Analysis Uncertain' };
    }
  };

  const config = getStatusConfig(result.status);
  const colorClass = `bg-${config.color}-50 text-${config.color}-700 border-${config.color}-200`;
  const btnClass = `bg-${config.color}-600 hover:bg-${config.color}-700 text-white`;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header Status Card */}
      <div className={`${colorClass} border rounded-2xl p-6 text-center shadow-sm flex flex-col items-center animate-fade-in`}>
        <div className={`p-4 bg-white rounded-full shadow-sm mb-4 text-${config.color}-600`}>
          {config.icon}
        </div>
        <h2 className="text-2xl font-bold mb-2">{config.label}</h2>
        <p className="opacity-90 max-w-md">{result.summary}</p>
        {result.veganStatus !== 'NOT_APPLICABLE' && (
           <span className={`mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-${config.color}-800 border border-${config.color}-200`}>
             Vegan Status: {result.veganStatus.replace('_', ' ')}
           </span>
        )}
      </div>

      {/* Flagged Ingredients */}
      {result.flaggedIngredients.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center gap-2">
            <AlertCircle className="text-rose-600 w-5 h-5" />
            <h3 className="font-semibold text-rose-800">Flagged Ingredients</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {result.flaggedIngredients.map((item, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-800">{item.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.severity} RISK
                  </span>
                </div>
                <p className="text-sm text-slate-600">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Terms Explained */}
      {result.technicalTerms.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center gap-2">
            <FlaskConical className="text-indigo-600 w-5 h-5" />
            <h3 className="font-semibold text-indigo-800">What's inside? (Technical Terms)</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {result.technicalTerms.map((term, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900">{term.term}</span>
                  {term.commonName && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      aka {term.commonName}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
                  {term.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-center z-20">
        <button
          onClick={onReset}
          className={`${btnClass} shadow-lg shadow-${config.color}-200/50 px-8 py-4 rounded-full font-bold text-lg w-full max-w-md transition-transform active:scale-95`}
        >
          Scan Another Item
        </button>
      </div>
    </div>
  );
};

export default ResultsView;
