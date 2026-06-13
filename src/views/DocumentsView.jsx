import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, Badge } from '../components/UI';
import { analyzeMedicalImage } from '../gemini';
import { AIReviewModal } from '../components/AIReviewModal';

export function DocumentsView() {
  const { user, addReport, addMedication, addDisease, addSurgery } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [search, setSearch] = useState('');
  
  // AI Scanning States
  const [scanLoading, setScanLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [aiExtractedData, setAiExtractedData] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [pendingReport, setPendingReport] = useState(null);

  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    const isImage = file.type.startsWith('image/');
    
    // Add file details to global reports state
    const newDoc = {
      name: file.name.split('.')[0],
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      lab: isImage ? 'AI Scan Extraction' : 'User Upload',
      type: file.name.split('.').pop().toUpperCase(),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      verified: false
    };

    if (isImage) {
      setScanLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1];
        setPreviewSrc(reader.result); // Set preview image
        
        try {
          const extracted = await analyzeMedicalImage(base64String, file.type);
          setPendingReport(newDoc);
          setAiExtractedData(extracted);
          setShowReviewModal(true);
        } catch (err) {
          console.error(err);
          alert('AI Analysis failed. Saving report directly without extraction.');
          await addReport(newDoc);
        } finally {
          setScanLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      await addReport(newDoc);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleApprove = async (verifiedData) => {
    setShowReviewModal(false);
    
    // 1. Add the report itself to database (marked as verified now!)
    if (pendingReport) {
      await addReport({ ...pendingReport, verified: true });
    }
    
    // 2. Add medications
    for (const med of verifiedData.medications) {
      await addMedication(med);
    }
    
    // 3. Add diseases
    for (const dis of verifiedData.diseases) {
      await addDisease(dis);
    }
    
    // 4. Add surgeries
    for (const surg of verifiedData.surgeries) {
      await addSurgery(surg);
    }
    
    // Clear temp states
    setAiExtractedData(null);
    setPreviewSrc(null);
    setPendingReport(null);
  };

  const filtered = user.reports.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.lab.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {scanLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-900/70 backdrop-blur-sm animate-fade-in text-white">
          <div className="w-12 h-12 border-4 rounded-full border-teal-400 border-t-transparent animate-spin mb-4" />
          <h3 className="font-display font-semibold text-lg">AI Document Analysis in Progress</h3>
          <p className="text-xs text-white/60 mt-1 text-center max-w-xs">Extracting medications, diseases, and surgical history using Gemini...</p>
        </div>
      )}

      <AIReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        extractedData={aiExtractedData}
        imageSrc={previewSrc}
        onApprove={handleApprove}
      />

      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm">
        <i className="ti ti-search text-gray-400 text-lg ml-2"/>
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents by name or lab..." 
          className="flex-1 text-sm outline-none border-none text-navy-600 bg-transparent placeholder-gray-300"
        />
      </div>

      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive ? 'border-teal-400 bg-teal-50/50' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/20'
        }`}
      >
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInput}/>
        <i className="ti ti-cloud-upload text-4xl text-gray-300 block mb-2"/>
        <p className="text-sm font-semibold text-navy-600">Drag files here or click to upload</p>
        <p className="text-xs text-gray-400 mt-1">PDF, DICOM, JPG, PNG up to 50MB</p>
      </div>

      <Card noPad>
        <CardHeader title="All Uploaded Documents" icon="ti-file-text"/>
        <div className="divide-y divide-gray-50">
          {filtered.length > 0 ? (
            filtered.map(r => (
              <div key={r.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500 flex-shrink-0">
                    <i className="ti ti-file-text text-lg"/>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-600">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.lab} · {r.date} · {r.type} · {r.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.verified ? 'green' : 'amber'}>{r.verified ? 'Verified' : 'Pending'}</Badge>
                  <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-teal-500 cursor-pointer border-none bg-transparent transition-colors">
                    <i className="ti ti-download text-base"/>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">No documents matching your search</div>
          )}
        </div>
      </Card>
    </div>
  );
}
