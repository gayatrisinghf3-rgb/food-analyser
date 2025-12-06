import React, { useState, useEffect } from 'react';
import { DietType, UserPreferences, AnalysisResult, SafetyStatus } from './types';
import PreferenceSelector from './components/PreferenceSelector';
import CameraScanner from './components/CameraScanner';
import ResultsView from './components/ResultsView';
import { analyzeIngredients } from './services/geminiService';
import { Camera, ScanSearch, Type, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    diet: DietType.NONE,
    allergies: [],
    customAvoidances: ''
  });

  const [mode, setMode] = useState<'SETUP' | 'SCAN_CAMERA' | 'SCAN_TEXT' | 'RESULTS'>('SETUP');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load preferences from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('labelLens_prefs');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved prefs");
      }
    }
  }, []);

  // Save preferences when changed
  useEffect(() => {
    localStorage.setItem('labelLens_prefs', JSON.stringify(preferences));
  }, [preferences]);

  const handleAnalysis = async (input: string, type: 'TEXT' | 'IMAGE') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await analyzeIngredients(input, type, preferences);
      setAnalysisResult(result);
      setMode('RESULTS');
    } catch (err) {
      setErrorMsg("Failed to analyze. Please try again. Ensure the image is clear or text is readable.");
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = (imageData: string) => {
    setMode('SETUP'); // Close camera view temporarily while loading
    handleAnalysis(imageData, 'IMAGE');
  };

  const renderHeader = () => (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-3 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
          <ScanSearch size={20} />
        </div>
        <h1 className="font-bold text-lg text-slate-800 tracking-tight">LabelLens</h1>
      </div>
      {mode === 'RESULTS' && (
         <div className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded">
            {preferences.diet}
         </div>
      )}
    </header>
  );

  if (mode === 'SCAN_CAMERA') {
    return <CameraScanner onCapture={handleCameraCapture} onClose={() => setMode('SETUP')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {renderHeader()}

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        
        {loading && (
          <div className="fixed inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
             <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
             <p className="text-lg font-medium text-slate-700">Analyzing Ingredients...</p>
             <p className="text-sm text-slate-500">Checking against {preferences.diet} & {preferences.allergies.length} allergens</p>
          </div>
        )}

        {mode === 'RESULTS' && analysisResult ? (
          <ResultsView 
            result={analysisResult} 
            onReset={() => {
              setAnalysisResult(null);
              setMode('SETUP');
              setTextInput('');
            }} 
          />
        ) : mode === 'SCAN_TEXT' ? (
          <div className="space-y-4 animate-fade-in">
             <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
               <h2 className="text-xl font-bold text-white mb-2">Paste Ingredients</h2>
               <p className="text-slate-400 text-sm mb-4">Copy the ingredient list from a website or type it manually.</p>
               <textarea
                 value={textInput}
                 onChange={(e) => setTextInput(e.target.value)}
                 className="w-full h-40 p-4 border border-slate-600 bg-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-white placeholder-slate-400"
                 placeholder="e.g. Water, Sugar, Citric Acid, Red 40..."
               ></textarea>
               <div className="flex gap-3 mt-4">
                 <button 
                   onClick={() => setMode('SETUP')}
                   className="flex-1 py-3 text-slate-300 font-medium hover:bg-slate-700 rounded-xl transition-colors border border-slate-600"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={() => handleAnalysis(textInput, 'TEXT')}
                   disabled={!textInput.trim()}
                   className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-900 disabled:opacity-50 disabled:shadow-none hover:bg-emerald-500 transition-all"
                 >
                   Analyze Text
                 </button>
               </div>
             </div>
          </div>
        ) : (
          <div className="space-y-6 pb-24 animate-fade-in">
            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100 text-sm">
                <AlertCircle size={20} className="shrink-0"/>
                {errorMsg}
              </div>
            )}

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200/50">
               <div className="flex items-start justify-between mb-4">
                 <div>
                    <h2 className="text-2xl font-bold">Safe Eating, Simplified.</h2>
                    <p className="text-emerald-100 mt-1">Scan labels to detect allergens and decode chemicals instantly.</p>
                 </div>
                 <Sparkles className="text-emerald-200" />
               </div>
               
               <div className="grid grid-cols-2 gap-3 mt-6">
                 <button
                   onClick={() => setMode('SCAN_CAMERA')}
                   className="bg-white/10 backdrop-blur hover:bg-white/20 border border-white/20 p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
                 >
                   <Camera size={32} />
                   <span className="font-semibold text-sm">Scan Label</span>
                 </button>
                 <button
                   onClick={() => setMode('SCAN_TEXT')}
                   className="bg-white/10 backdrop-blur hover:bg-white/20 border border-white/20 p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
                 >
                   <Type size={32} />
                   <span className="font-semibold text-sm">Type / Paste</span>
                 </button>
               </div>
            </div>

            <div className="flex items-center gap-4 my-2">
               <div className="h-px bg-slate-200 flex-1"></div>
               <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Configure Profile</span>
               <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <PreferenceSelector 
              preferences={preferences} 
              onUpdate={setPreferences} 
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;