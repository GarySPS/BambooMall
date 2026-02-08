//src>pages>KYCVerificationPage.js

import React, { useState, useEffect } from 'react';
import { useUser } from "../contexts/UserContext"; 
import { toast } from "react-toastify"; 
import { API_BASE_URL } from "../config";
import { 
  FaUserShield, 
  FaCamera, 
  FaIdCard, 
  FaCheckCircle, 
  FaArrowLeft, 
  FaLock, 
  FaInfoCircle, 
  FaFileContract, 
  FaClock
} from 'react-icons/fa';

// --- Sub-components ---
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Officer Details', icon: FaUserShield },
    { id: 2, label: 'Govt. ID', icon: FaIdCard },
    { id: 3, label: 'Biometric Scan', icon: FaCamera },
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mb-8 md:mb-12 border-b border-slate-200 pb-4 px-2">
      {steps.map((step) => (
        <div key={step.id} className={`flex flex-col items-center relative ${currentStep >= step.id ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`w-8 h-8 flex items-center justify-center rounded-full mb-2 ${
              currentStep >= step.id ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
             <step.icon size={12} />
          </div>
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-600 text-center">
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const UploadZone = ({ label, description, onFileSelect, file, icon: Icon }) => (
  <div className="group relative w-full">
    <input type="file" accept="image/*" onChange={(e) => onFileSelect(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
    <div className={`border border-dashed rounded-xl p-6 transition-all flex flex-col items-center text-center h-full justify-center ${
      file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 group-hover:border-blue-400 group-hover:bg-white'
    }`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
        file ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 border border-slate-200'
      }`}>
        {file ? <FaCheckCircle size={20} /> : <Icon size={20} />}
      </div>
      <p className="text-xs font-bold text-slate-800 uppercase">{file ? "File Selected" : label}</p>
      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{file ? file.name : description}</p>
    </div>
  </div>
);

export default function KYCVerificationPage() {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', idNumber: '', phone: '', address: '',
    idFront: null, idBack: null, selfie: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Valid "Load Once" Check
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // --- SECURE UPLOAD ---
  const uploadFile = async (file) => {
    if (!file) return null; 
    const token = localStorage.getItem("token"); // <--- Get Token
    const data = new FormData();
    data.append("file", file);
    
    const res = await fetch(`${API_BASE_URL}/upload/kyc`, { 
        method: "POST", 
        headers: {
            "Authorization": `Bearer ${token}` // <--- Attach Token
        },
        body: data 
    });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    return json.url;
  };

  const handleSubmit = async () => {
    if (!formData.idFront || !formData.selfie) {
        return toast.error("Front ID and Selfie are required.");
    }

    setIsSubmitting(true);
    try {
      setStatusMessage("Encrypting & Uploading Documents...");
      
      const frontUrl = await uploadFile(formData.idFront);
      const backUrl = formData.idBack ? await uploadFile(formData.idBack) : "NOT_PROVIDED";
      const selfieUrl = await uploadFile(formData.selfie);

      setStatusMessage("Transmitting to Compliance Ledger...");
      
      // --- SECURE SUBMISSION ---
      const token = localStorage.getItem("token"); // <--- Get Token
      const res = await fetch(`${API_BASE_URL}/kyc/submit-application`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // <--- Attach Token
        },
        body: JSON.stringify({
          short_id: user.short_id,
          full_name: formData.fullName,
          id_number: formData.idNumber,
          phone: formData.phone,
          address: formData.address,
          front_url: frontUrl,
          back_url: backUrl,
          selfie_url: selfieUrl
        })
      });

      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Submission failed");
      }
      
      await refreshUser(); 
      toast.success("Security Clearance Request Submitted");
      
    } catch (error) {
      toast.error(error.message);
      setIsSubmitting(false); 
    } 
  };

  // --- STATE: PENDING VERIFICATION ---
  if (user?.kyc_status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        {/* Changed to Blue/Slate for a calmer, more secure feel */}
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 border-4 border-blue-100 animate-pulse">
          <FaUserShield size={32} />
        </div>
        
        <h1 className="text-xl font-bold text-slate-800 tracking-wide uppercase">Verification in Progress</h1>
        
        <div className="max-w-xs mx-auto mt-4 space-y-4">
          <p className="text-slate-500 text-sm leading-relaxed">
            Your documents have been encrypted and are currently under review in accordance with our <strong>Registration Policy</strong>. 
          </p>
          
          {/* Privacy Reassurance */}
          <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
             <div className="flex items-center gap-2 justify-center text-xs font-bold text-slate-700 mb-1">
                <FaLock size={10} className="text-emerald-500" /> Secure Submission
             </div>
             <p className="text-[10px] text-slate-400 leading-tight">
               Your information is strictly private and never shared externally.
             </p>
          </div>

          {/* Time Expectation */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 py-2 rounded-full">
            <FaClock size={12} />
            <span>Estimated wait: <strong>15 mins - 1 hour</strong></span>
          </div>
        </div>

        <button onClick={() => window.location.href = '/profile'} className="mt-8 text-xs font-bold text-blue-900 uppercase tracking-wide hover:underline">
          Return to Profile
        </button>
      </div>
    );
  }

  // --- STATE: APPROVED ---
  if (user?.kyc_status === 'approved') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-100">
          <FaCheckCircle size={32} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-wide uppercase">Clearance Granted</h1>
        <p className="text-slate-500 max-w-xs mx-auto text-sm mt-3 leading-relaxed">
          Level 2 Access Unlocked. You may now execute high-volume allocation requests.
        </p>
        <button onClick={() => window.location.href = '/profile'} className="mt-8 px-8 py-3 bg-blue-900 text-white font-bold rounded-lg text-xs uppercase tracking-widest shadow-lg">
          Return to Console
        </button>
      </div>
    );
  }

  // --- STATE: MAIN FORM ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition" onClick={() => window.location.href = '/profile'}>
            <FaArrowLeft /> <span className="text-xs font-bold uppercase hidden md:inline">Exit Verification</span><span className="md:hidden text-xs font-bold uppercase">Exit</span>
          </button>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <FaLock size={10} /> TLS ENCRYPTED
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 md:px-6 pt-8 md:pt-10">
        <StepIndicator currentStep={step} />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Step 1: Officer Info */}
          {step === 1 && (
            <div className="p-6 md:p-8 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                 <FaUserShield className="text-blue-900"/> Officer Details
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Full Legal Name</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-base focus:border-blue-900 outline-none transition-colors" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="As per Govt ID" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">ID / Passport No.</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-base focus:border-blue-900 outline-none transition-colors" value={formData.idNumber} onChange={(e) => setFormData({...formData, idNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Secure Phone</label>
                    <input type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-base focus:border-blue-900 outline-none transition-colors" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Registered Address</label>
                    <textarea rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-base focus:border-blue-900 outline-none transition-colors resize-none" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <button onClick={nextStep} disabled={!formData.fullName || !formData.idNumber} className="w-full mt-8 py-4 bg-blue-900 text-white font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-blue-800 disabled:opacity-50 transition-all shadow-md">
                Proceed to Documentation
              </button>
            </div>
          )}

          {/* Step 2: ID Upload */}
          {step === 2 && (
            <div className="p-6 md:p-8 animate-fade-in">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                     <FaIdCard className="text-blue-900"/> Documents
                  </h2>
                  <button onClick={prevStep} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                      <FaArrowLeft/> Back
                  </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-[11px] text-blue-800 flex gap-3 leading-relaxed">
                  <FaInfoCircle className="mt-0.5 shrink-0 text-blue-600"/> 
                  <span>Ensure all four corners of the ID are visible. Text must be clear and legible. High-resolution preferred.</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UploadZone 
                    label="Front Side" 
                    description="National ID / Passport" 
                    icon={FaFileContract} 
                    file={formData.idFront} 
                    onFileSelect={(f) => setFormData({...formData, idFront: f})} 
                  />
                  
                  <UploadZone 
                    label="Reverse Side" 
                    description="Optional (If applicable)" 
                    icon={FaFileContract} 
                    file={formData.idBack} 
                    onFileSelect={(f) => setFormData({...formData, idBack: f})} 
                  />
                </div>
              </div>
              
              <button onClick={nextStep} disabled={!formData.idFront} className="w-full mt-8 py-4 bg-blue-900 text-white font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-blue-800 disabled:opacity-50 transition-all shadow-md">
                Proceed to Biometrics
              </button>
            </div>
          )}

          {/* Step 3: Biometric Scan */}
          {step === 3 && (
            <div className="p-6 md:p-8 animate-fade-in text-center">
              <div className="flex justify-start mb-6">
                  <button onClick={prevStep} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"><FaArrowLeft/> Back</button>
              </div>
              
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center justify-center gap-2">
                 <FaCamera className="text-blue-900"/> Biometric Check
              </h2>
              <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">Please upload a real-time selfie to verify officer identity against the ID provided.</p>
              
              <div className="flex justify-center mb-8">
                <div className="w-48 h-48 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center relative bg-slate-50 hover:bg-white transition-all overflow-hidden group">
                   {formData.selfie ? (
                     <div className="absolute inset-0">
                       <img src={URL.createObjectURL(formData.selfie)} alt="Scan" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                           <FaCamera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24}/>
                       </div>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center">
                        <div className="p-4 bg-slate-100 rounded-full mb-2">
                            <FaCamera size={32} className="text-slate-400" />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Tap to Capture</span>
                     </div>
                   )}
                   <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFormData({...formData, selfie: e.target.files[0]})} />
                </div>
              </div>

              <button onClick={handleSubmit} disabled={!formData.selfie || isSubmitting} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 shadow-lg transition-all">
                {isSubmitting ? (statusMessage || "Processing Secure Data...") : "Submit for Security Clearance"}
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-[10px] text-slate-400 font-mono">
           <p>Data stored in ISO 27001 certified vault. Ref: SEC-9920</p>
        </div>
      </main>
    </div>
  );
}