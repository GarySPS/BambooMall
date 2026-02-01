// src/pages/KYCVerificationPage.js

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
    <div className="flex items-center justify-between w-full max-w-md mx-auto mb-12 border-b border-slate-200 pb-4">
      {steps.map((step) => (
        <div key={step.id} className={`flex flex-col items-center relative ${currentStep >= step.id ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`w-8 h-8 flex items-center justify-center rounded-full mb-2 ${
             currentStep >= step.id ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
             <step.icon size={12} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const UploadZone = ({ label, description, onFileSelect, file, icon: Icon }) => (
  <div className="group relative">
    <input type="file" accept="image/*" onChange={(e) => onFileSelect(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
    <div className={`border border-dashed rounded p-6 transition-all flex flex-col items-center text-center ${
      file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 group-hover:border-blue-400 group-hover:bg-white'
    }`}>
      <div className={`w-10 h-10 rounded flex items-center justify-center mb-3 ${
        file ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 border border-slate-200'
      }`}>
        {file ? <FaCheckCircle size={20} /> : <Icon size={20} />}
      </div>
      <p className="text-xs font-bold text-slate-800 uppercase">{file ? file.name : label}</p>
      <p className="text-[10px] text-slate-500 mt-1">{description}</p>
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => { refreshUser(); }, [refreshUser]);

  // Polling for status updates
  useEffect(() => {
    let interval;
    if (user?.kyc_status === 'pending') {
      interval = setInterval(() => { refreshUser(); }, 5000);
    }
    return () => clearInterval(interval);
  }, [user?.kyc_status, refreshUser]);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const uploadFile = async (file) => {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch(`${API_BASE_URL}/upload/kyc`, { method: "POST", body: data });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    return json.url;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      setStatusMessage("Encrypting & Uploading Documents...");
      const frontUrl = await uploadFile(formData.idFront);
      const backUrl = await uploadFile(formData.idBack);
      const selfieUrl = await uploadFile(formData.selfie);

      setStatusMessage("Transmitting to Compliance Ledger...");
      const res = await fetch(`${API_BASE_URL}/kyc/submit-application`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      if (!res.ok) throw new Error("Submission failed");
      await refreshUser();
      setIsSuccess(true);
      toast.success("Security Clearance Request Submitted");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- STATE: PENDING AUDIT ---
  if (user?.kyc_status === 'pending' && !isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded flex items-center justify-center mb-6 animate-pulse border border-amber-200">
          <FaClock size={24} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-wide uppercase">Audit in Progress</h1>
        <p className="text-slate-500 max-w-xs mx-auto text-xs mt-2 leading-relaxed font-mono">
          Security clearance pending. Credentials are being verified against international watchlists.
        </p>
      </div>
    );
  }

  // --- STATE: APPROVED ---
  if (user?.kyc_status === 'approved') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center mb-6 border border-emerald-200">
          <FaCheckCircle size={24} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-wide uppercase">Clearance Granted</h1>
        <p className="text-slate-500 max-w-xs mx-auto text-xs mt-2 font-mono">
          Level 2 Access Unlocked. You may now execute high-volume allocation requests.
        </p>
        <button onClick={() => window.location.href = '/profile'} className="mt-8 px-6 py-2 bg-blue-900 text-white font-bold rounded text-xs uppercase tracking-wide">
          Return to Console
        </button>
      </div>
    );
  }

  // --- STATE: MAIN FORM ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition" onClick={() => window.location.href = '/profile'}>
            <FaArrowLeft /> <span className="text-xs font-bold uppercase">Exit Verification</span>
          </button>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded">
            <FaLock /> TLS ENCRYPTED CHANNEL
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-10">
        <StepIndicator currentStep={step} />

        <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Step 1: Officer Info */}
          {step === 1 && (
            <div className="p-8 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide mb-6 flex items-center gap-2">
                 <FaUserShield className="text-blue-900"/> Officer Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Legal Name</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm focus:border-blue-900 outline-none" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID / Passport No.</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm focus:border-blue-900 outline-none" value={formData.idNumber} onChange={(e) => setFormData({...formData, idNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Phone</label>
                    <input type="tel" className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm focus:border-blue-900 outline-none" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Address</label>
                    <textarea rows={2} className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm focus:border-blue-900 outline-none" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <button onClick={nextStep} disabled={!formData.fullName || !formData.idNumber} className="w-full mt-8 py-3 bg-blue-900 text-white font-bold rounded text-xs uppercase tracking-widest hover:bg-blue-800 disabled:opacity-50">
                Proceed to Documentation
              </button>
            </div>
          )}

          {/* Step 2: ID Upload */}
          {step === 2 && (
            <div className="p-8 animate-fade-in">
              <button onClick={prevStep} className="mb-4 text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"><FaArrowLeft/> Back</button>
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide mb-6 flex items-center gap-2">
                 <FaIdCard className="text-blue-900"/> Identification Document
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded text-[10px] text-blue-800 flex gap-2">
                  <FaInfoCircle className="mt-0.5"/> Ensure all four corners are visible. Text must be legible.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <UploadZone label="Front Side" description="National ID / Passport" icon={FaFileContract} file={formData.idFront} onFileSelect={(f) => setFormData({...formData, idFront: f})} />
                  <UploadZone label="Reverse Side" description="If applicable" icon={FaFileContract} file={formData.idBack} onFileSelect={(f) => setFormData({...formData, idBack: f})} />
                </div>
              </div>
              <button onClick={nextStep} disabled={!formData.idFront} className="w-full mt-8 py-3 bg-blue-900 text-white font-bold rounded text-xs uppercase tracking-widest hover:bg-blue-800 disabled:opacity-50">
                Proceed to Biometrics
              </button>
            </div>
          )}

          {/* Step 3: Biometric Scan */}
          {step === 3 && (
            <div className="p-8 animate-fade-in text-center">
              <button onClick={prevStep} className="mb-4 text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"><FaArrowLeft/> Back</button>
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center justify-center gap-2">
                 <FaCamera className="text-blue-900"/> Biometric Liveness Check
              </h2>
              <p className="text-xs text-slate-500 mb-8">Please upload a real-time photo to verify officer identity.</p>
              
              <div className="flex justify-center mb-8">
                <div className="w-40 h-40 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center relative bg-slate-50 hover:bg-white transition-colors">
                   {formData.selfie ? (
                     <div className="absolute inset-0 rounded-full overflow-hidden">
                       <img src={URL.createObjectURL(formData.selfie)} alt="Scan" className="w-full h-full object-cover" />
                     </div>
                   ) : (
                     <FaCamera size={32} className="text-slate-300" />
                   )}
                   <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFormData({...formData, selfie: e.target.files[0]})} />
                </div>
              </div>

              {/* FIXED: Replaced static text with 'statusMessage' to use the variable */}
              <button onClick={handleSubmit} disabled={!formData.selfie || isSubmitting} className="w-full py-4 bg-emerald-600 text-white font-bold rounded text-xs uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 shadow-lg">
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