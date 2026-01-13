//src>pages>KYCVerificationPage.js

import React, { useState, useEffect } from 'react'; // Added useEffect
import { useUser } from "../contexts/UserContext"; 
import { toast } from "react-toastify"; 
import { 
  ShieldCheck, Camera, User, IdCard, CheckCircle2, 
  ChevronRight, ArrowLeft, Lock, Info, FileText, Smartphone, Clock // Added Clock icon
} from 'lucide-react';

// --- Sub-components (Kept the same) ---
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Personal', icon: User },
    { id: 2, label: 'Identity', icon: IdCard },
    { id: 3, label: 'Selfie', icon: Camera },
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mb-12">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
              currentStep >= step.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
            }`}>
              <step.icon size={20} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${
              currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-[2px] mx-2 -mt-6 bg-gray-100 relative">
              <div className="absolute h-full bg-blue-600 transition-all duration-700" style={{ width: currentStep > step.id ? '100%' : '0%' }} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const UploadZone = ({ label, description, onFileSelect, file, icon: Icon }) => (
  <div className="group relative">
    <input type="file" accept="image/*" onChange={(e) => onFileSelect(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
    <div className={`border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center text-center ${
      file ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 group-hover:border-blue-400 group-hover:bg-blue-50/30'
    }`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
        file ? 'bg-green-100 text-green-600' : 'bg-white text-gray-400 shadow-sm'
      }`}>
        {file ? <CheckCircle2 size={24} /> : <Icon size={24} />}
      </div>
      <p className="text-sm font-bold text-gray-900">{file ? file.name : label}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  </div>
);


export default function KYCVerificationPage() {
  const { user, refreshUser } = useUser();
  
  // 1. ADD THIS CONSTANT TO USE YOUR ENV VARIABLE
  // This ensures we use the full backend URL in production
  const API_BASE = process.env.REACT_APP_API_BASE_URL; 

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    phone: '',
    address: '',
    idFront: null,
    idBack: null,
    selfie: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    refreshUser();
  }, []);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // 2. UPDATE THIS FUNCTION
  const uploadFile = async (file) => {
    const data = new FormData();
    data.append("file", file);

    // FIXED: Use API_BASE instead of hardcoded "/api"
    // Remove the '/api' from the string if your env variable already includes it
    const res = await fetch(`${API_BASE}/upload/kyc`, { 
      method: "POST", 
      body: data 
    });

    if (!res.ok) throw new Error("File upload failed");
    const json = await res.json();
    return json.url;
  };

  // 3. UPDATE THIS FUNCTION
  const handleSubmit = async () => {
    if(!user) {
        toast.error("User session not found. Please login again.");
        return;
    }
    setIsSubmitting(true);
    
    try {
      setStatusMessage("Uploading Front ID...");
      const frontUrl = await uploadFile(formData.idFront);
      
      setStatusMessage("Uploading Back ID...");
      const backUrl = await uploadFile(formData.idBack);
      
      setStatusMessage("Uploading Selfie...");
      const selfieUrl = await uploadFile(formData.selfie);

      setStatusMessage("Finalizing Application...");
      
      // FIXED: Use API_BASE here as well
      const res = await fetch(`${API_BASE}/kyc/submit-application`, {
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

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Submission failed");
      }

      await refreshUser();
      setIsSuccess(true);
      toast.success("KYC Submitted Successfully!");
      
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error submitting KYC");
      setStatusMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW: BLOCKING SCREEN IF PENDING ---
  if (user?.kyc_status === 'pending' && !isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Clock size={48} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">In Review</h1>
        <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
          Your documents are currently being reviewed by our team. You cannot submit a new application until this one is processed.
        </p>
        <button 
          onClick={() => window.location.href = '/profile'} 
          className="mt-10 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // --- NEW: BLOCKING SCREEN IF APPROVED ---
  if (user?.kyc_status === 'approved') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Verified!</h1>
        <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
          Your identity has been verified. You have full access to all features.
        </p>
        <button 
          onClick={() => window.location.href = '/profile'} 
          className="mt-10 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Verification Submitted</h1>
        <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
          Our security team is currently reviewing your documents.
        </p>
        <button 
          onClick={() => window.location.href = '/profile'} 
          className="mt-10 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ... (The rest of your JSX form code is below, unchanged)
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased pb-12">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/profile'}>
            <ArrowLeft size={20} className="text-gray-500" />
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">B</div>
            <span className="font-black text-xl tracking-tighter uppercase">BambooMall</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
            <Lock size={12} className="text-blue-500" />
            SECURE ENCRYPTION
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-10">
        <StepIndicator currentStep={step} />

        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="p-8 md:p-12 animate-in slide-in-from-right-4 duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Account Information</h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">Please provide your legal details as shown on your ID.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                  <input type="text" placeholder="e.g. Zhang Wei" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">ID / Passport Number</label>
                    <input type="text" placeholder="Enter ID number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.idNumber} onChange={(e) => setFormData({...formData, idNumber: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input type="tel" placeholder="+86 123..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Registered Address</label>
                    <textarea placeholder="Your residential address" rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>

              <button onClick={nextStep} disabled={!formData.fullName || !formData.idNumber} className="w-full mt-10 py-5 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100">
                Continue to Identity <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: ID Upload */}
          {step === 2 && (
            <div className="p-8 md:p-12 animate-in slide-in-from-right-4 duration-300">
              <button onClick={prevStep} className="mb-6 flex items-center gap-2 text-gray-400 font-bold text-sm hover:text-gray-900 transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Identity Verification</h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">Upload a clear photo of your government-issued ID.</p>
              </div>
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                  <Info className="text-blue-600 shrink-0" size={20} />
                  <div className="text-xs text-blue-700 leading-relaxed font-medium">
                    Ensure all four corners are visible, text is readable, and there is no glare.
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <UploadZone label="Front of ID" description="National ID or Passport" icon={IdCard} file={formData.idFront} onFileSelect={(file) => setFormData({...formData, idFront: file})} />
                  <UploadZone label="Back of ID" description="Reverse side (if applicable)" icon={FileText} file={formData.idBack} onFileSelect={(file) => setFormData({...formData, idBack: file})} />
                </div>
              </div>
              <button onClick={nextStep} disabled={!formData.idFront} className="w-full mt-10 py-5 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100">
                Continue to Selfie <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Step 3: Selfie Verification */}
          {step === 3 && (
            <div className="p-8 md:p-12 animate-in slide-in-from-right-4 duration-300 text-center">
              <button onClick={prevStep} className="mb-6 flex items-center gap-2 text-gray-400 font-bold text-sm hover:text-gray-900 transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Biometric Check</h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">Take a selfie face.</p>
              </div>
              <div className="flex justify-center mb-8">
                <div className="w-48 h-48 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center relative bg-gray-50">
                   {formData.selfie ? (
                     <div className="absolute inset-0 rounded-full overflow-hidden">
                       <img src={URL.createObjectURL(formData.selfie)} alt="Selfie" className="w-full h-full object-cover" />
                     </div>
                   ) : (
                     <Camera size={48} className="text-gray-300" />
                   )}
                   <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFormData({...formData, selfie: e.target.files[0]})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-8">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Smartphone size={16} className="mx-auto mb-2 text-blue-500" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Clear Focus</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <User size={16} className="mx-auto mb-2 text-blue-500" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Face Centered</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <IdCard size={16} className="mx-auto mb-2 text-blue-500" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase">ID Avatar Visible</p>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={!formData.selfie || isSubmitting} className="w-full py-5 bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-black disabled:opacity-50 transition-all shadow-xl">
                {isSubmitting ? (
                   <div className="flex items-center gap-2">
                     <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                     {statusMessage || "Processing..."}
                   </div>
                ) : (
                  <>Submit Application <ShieldCheck size={18} /></>
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 opacity-40">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] mb-1">Encrypted by</span>
              <div className="font-serif text-lg font-bold italic">AES-256</div>
            </div>
            <div className="w-[1px] h-8 bg-gray-300" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] mb-1">Regulatory</span>
              <div className="font-sans text-sm font-black">COMPLIANT</div>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-6 max-w-xs mx-auto font-medium">
            Your data is stored in ISO 27001 certified data centers. We never share your personal documents with third-party marketplaces.
          </p>
        </div>
      </main>
    </div>
  );
}