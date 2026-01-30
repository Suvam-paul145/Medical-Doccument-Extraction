import React, { useState, useEffect } from 'react';
import {
    Upload,
    FileText,
    CheckCircle,
    Activity,
    Cpu,
    Database,
    Scan,
    FileJson,
    AlertCircle,

    Stethoscope,
    Pill,
    User,

    X,
    Sparkles,
    ShieldCheck,
    MessageSquare,
    Loader2,
    Image as ImageIcon,
    Mic,
    MicOff,
    Volume2
} from 'lucide-react';

/**
 * PROCESSING STAGES
 * Defines the architectural steps shown to the user.
 * These are visual representations of the AI's internal process.
 */
const STAGES = [
    {
        id: 'upload',
        label: 'Document Ingestion',
        icon: Upload,
        desc: 'Validating file format and secure upload.'
    },
    {
        id: 'preprocessing',
        label: 'Image Preprocessing',
        icon: Scan,
        desc: 'Binarization, noise reduction, and deskewing.'
    },
    {
        id: 'ocr',
        label: 'OCR Extraction',
        icon: FileText,
        desc: 'Optical Character Recognition via Vision API.'
    },
    {
        id: 'ner',
        label: 'Entity Recognition (NER)',
        icon: Cpu,
        desc: 'Identifying drugs, dosages, and patient entities using NLP.'
    },
    {
        id: 'normalization',
        label: 'Data Normalization',
        icon: Database,
        desc: 'Mapping raw text to RxNorm and ICD-10 standards.'
    },
    {
        id: 'complete',
        label: 'JSON Construction',
        icon: FileJson,
        desc: 'Final structured output generation.'
    }
];

export default function MedicalDocExtractor() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
    const [currentStage, setCurrentStage] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [result, setResult] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Gemini State
    const [geminiResult, setGeminiResult] = useState<string | null>(null);
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);
    const [activeGeminiMode, setActiveGeminiMode] = useState<'explain' | 'interactions' | null>(null);

    // Voice Assistant State
    const [isListening, setIsListening] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = React.useRef<any>(null);

    // --- UTILITIES ---
    const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64Data = base64String.split(',')[1];
                resolve({
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type,
                    },
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // --- CORE EXTRACTION LOGIC ---
    const startProcessing = async () => {
        if (!file) return;

        // Reset State
        setStatus('processing');
        setCurrentStage(0);
        setLogs([]);
        setResult(null);
        setErrorMessage(null);
        setGeminiResult(null);
        setActiveGeminiMode(null);

        // 1. Start Visualization Loop (runs independently of API call to show progress)
        let stageIndex = 0;
        const logInterval = setInterval(() => {
            if (stageIndex < STAGES.length - 1) { // Don't go to 'complete' until API returns
                stageIndex++;
                setCurrentStage(stageIndex);

                // Generate visual logs
                const stageId = STAGES[stageIndex].id;
                const newLogs: string[] = [];
                if (stageId === 'preprocessing') newLogs.push(`[SYS] Optimizing image contrast...`);
                if (stageId === 'ocr') newLogs.push(`[SYS] Detecting text regions...`);
                if (stageId === 'ner') newLogs.push(`[AI] Analyzing clinical entities...`);
                if (stageId === 'normalization') newLogs.push(`[DB] Standardizing output format...`);
                setLogs(prev => [...prev, ...newLogs]);
            }
        }, 2000);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            
            if (!apiKey) {
                throw new Error("API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.");
            }

            // 2. Prepare Image for API
            const imagePart = await fileToGenerativePart(file);

            // 3. Construct Extraction Prompt
            const extractionPrompt = `
            You are an advanced medical document extractor. 
            Analyze the provided image of a prescription, medical report, or lab result.
            
            Extract the data into the following strict JSON structure. 
            If a field is not present or illegible, use null or an empty string. 
            Do not hallucinate data.
            
            JSON Structure:
{
    "metadata": {
        "document_type": "string (e.g., 'Prescription', 'Lab Report', 'Clinical Note')",
            "confidence_score": "number (0-1 estimate based on legibility)"
    },
    "patient": {
        "name": "string",
            "dob": "string (YYYY-MM-DD format if available)",
                "mrn": "string (Medical Record Number)",
                    "address": "string"
    },
    "provider": {
        "name": "string",
            "license_id": "string",
                "facility": "string",
                    "specialty": "string"
    },
    "medications": [
        {
            "name": "string",
            "dosage": "string",
            "route": "string",
            "frequency": "string",
            "quantity": "string",
            "refills": "number or string"
        }
    ],
        "diagnosis_codes": [
            {
                "code": "string (ICD-10 if visible)",
                "description": "string"
            }
        ]
}

            Return ONLY raw JSON.No markdown formatting(no \`\`\`json blocks).
        `;

            // 4. Call Gemini Vision API
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            role: "user",
                            parts: [
                                { text: extractionPrompt },
                                imagePart
                            ]
                        }]
                    })
                }
            );

            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) throw new Error("No data extracted from image.");

            // 5. Parse and Set Result
            // Clean markdown if present just in case
            const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedResult = JSON.parse(cleanJson);

            // Add timestamp manually since LLM doesn't know current time
            parsedResult.metadata.processed_at = new Date().toISOString();

            setResult(parsedResult);
            setCurrentStage(STAGES.length - 1); // Jump to complete
            setStatus('complete');
            setLogs(prev => [...prev, `[SUCCESS] Data extracted successfully.`]);

        } catch (err: any) {
            console.error(err);
            setErrorMessage(err.message || "Failed to process document");
            setStatus('error');
        } finally {
            clearInterval(logInterval);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) processFileSelection(droppedFile);
    };

    const processFileSelection = (selectedFile: File) => {
        if (!selectedFile.type.startsWith('image/')) {
            setErrorMessage("Please upload an image file (PNG, JPG, WEBP). PDF parsing is currently restricted.");
            return;
        }
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setErrorMessage(null);
    };

    const handleReset = () => {
        setFile(null);
        setPreviewUrl(null);
        setStatus('idle');
        setLogs([]);
        setResult(null);
        setCurrentStage(0);
        setGeminiResult(null);
        setActiveGeminiMode(null);
        setErrorMessage(null);
    };

    // --- GEMINI ANALYSIS FEATURES ---
    const callGeminiAnalysis = async (mode: 'explain' | 'interactions') => {
        if (!result) return;
        setIsGeminiLoading(true);
        setActiveGeminiMode(mode);
        setGeminiResult(null);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        
        if (!apiKey) {
            setGeminiResult("API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.");
            setIsGeminiLoading(false);
            return;
        }
        
        const context = JSON.stringify(result);

        let systemPrompt = "";
        let userPrompt = "";

        if (mode === 'explain') {
            systemPrompt = "You are a compassionate medical assistant. Explain medical data to a patient in simple, reassuring, plain English.";
            userPrompt = `Based on this extracted data: ${context}. Provide a friendly summary for the patient. Explain the medications (what they treat) and diagnosis codes in simple terms. Use bullet points.`;
        } else {
            systemPrompt = "You are a clinical pharmacist AI. Identify drug interactions.";
            userPrompt = `Analyze this data: ${context}. 1. Check for drug-drug interactions. 2. Check dose appropriateness if possible. 3. Return a safety assessment. Be concise.`;
        }

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: userPrompt }] }],
                        systemInstruction: { parts: [{ text: systemPrompt }] }
                    })
                }
            );

            if (!response.ok) throw new Error('API call failed');
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate analysis.";
            setGeminiResult(text);
        } catch (e) {
            setGeminiResult("System Warning: Unable to connect to AI analysis service.");
        } finally {
            setIsGeminiLoading(false);
        }
    };

    // --- VOICE ASSISTANT LOGIC ---
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result) => result.transcript)
                    .join('');
                setVoiceTranscript(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                if (voiceTranscript) {
                    handleVoiceQuery(voiceTranscript);
                }
            };
        }
    }, [voiceTranscript]); // Dependency on voiceTranscript to capture latest state on end

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setVoiceTranscript("");
            setIsSpeaking(false);
            window.speechSynthesis.cancel(); // Stop any current speech
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleVoiceQuery = async (query: string) => {
        if (!query.trim() || !result) return;

        // Add user message immediately
        const newHistory = [...chatHistory, { role: 'user' as const, text: query }];
        setChatHistory(newHistory);
        setVoiceTranscript(""); // Clear transcript for UI

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        
        if (!apiKey) {
            const errorMsg = "API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.";
            setChatHistory(prev => [...prev, { role: 'ai', text: errorMsg }]);
            speakResponse(errorMsg);
            return;
        }
        
        const context = JSON.stringify(result); // Medical context
        const prompt = `You are a helpful medical voice assistant. The user is asking about their extracted medical data: ${context}. 
                        User Question: "${query}". 
                        Answer accurately, concisely, and in a friendly conversational tone suitable for speech synthesis. Keep it under 3 sentences if possible.`;

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );

            const data = await response.json();
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";

            // Add AI response
            setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
            speakResponse(aiResponse);

        } catch (error) {
            console.error("Voice AI Error:", error);
            const errorMsg = "Sorry, I'm having trouble connecting to the brain.";
            setChatHistory(prev => [...prev, { role: 'ai', text: errorMsg }]);
            speakResponse(errorMsg);
        }
    };

    const speakResponse = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-100 selection:text-teal-900">

            {/* HEADER */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-teal-600 p-2 rounded-lg">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">MediParse<span className="text-teal-600">.AI</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
                        <span className="hover:text-teal-600 cursor-pointer">Documentation</span>
                        <span className="hover:text-teal-600 cursor-pointer">API Reference</span>
                        <div className="flex items-center gap-2 text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                            Live Gemini Vision
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Input & Visualization */}
                <div className="lg:col-span-6 space-y-6">

                    {/* 1. UPLOAD AREA */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-teal-600" />
                                Document Input
                            </h2>
                            {file && status === 'idle' && (
                                <button
                                    onClick={startProcessing}
                                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-teal-200"
                                >
                                    <Scan className="w-4 h-4" />
                                    Process Image
                                </button>
                            )}
                            {(status === 'complete' || status === 'error') && (
                                <button
                                    onClick={handleReset}
                                    className="text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Reset
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            {!file ? (
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-teal-500 hover:bg-teal-50/50 transition-all cursor-pointer group"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-100 transition-colors">
                                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-teal-600 transition-colors" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">Drop prescription image</h3>
                                    <p className="text-slate-500 mt-2 text-sm">Supports PNG, JPG, WEBP</p>
                                    <input
                                        type="file"
                                        id="file-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && processFileSelection(e.target.files[0])}
                                    />
                                    {errorMessage && (
                                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 justify-center">
                                            <AlertCircle className="w-4 h-4" />
                                            {errorMessage}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden">
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-6 h-6 text-teal-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB • {file.type}</p>
                                            </div>
                                        </div>
                                        {status === 'idle' && (
                                            <button onClick={handleReset} className="text-slate-400 hover:text-red-500">
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Error Message Display */}
                                    {status === 'error' && (
                                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold">Extraction Failed</p>
                                                <p className="opacity-90">{errorMessage}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. ARCHITECTURE PIPELINE VISUALIZATION */}
                    {(status === 'processing' || status === 'complete') && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Cpu className="w-5 h-5 text-teal-600" />
                                    Processing Pipeline
                                </h2>
                            </div>
                            <div className="p-6 relative">
                                {/* Connecting Line */}
                                <div className="absolute left-[2.85rem] top-6 bottom-6 w-0.5 bg-slate-100"></div>

                                <div className="space-y-6 relative">
                                    {STAGES.map((stage, index) => {
                                        const isActive = index === currentStage;
                                        const isCompleted = index < currentStage;
                                        const isPending = index > currentStage;

                                        return (
                                            <div key={stage.id} className={`flex items-start gap-4 transition-all duration-500 ${isActive ? 'scale-100 opacity-100' : 'opacity-60'}`}>
                                                {/* Icon Circle */}
                                                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors duration-300
                           ${isActive ? 'border-teal-600 bg-teal-50 text-teal-600 shadow-md shadow-teal-100' : ''}
                           ${isCompleted ? 'border-teal-600 bg-teal-600 text-white' : ''}
                           ${isPending ? 'border-slate-200 bg-white text-slate-300' : ''}
                         `}>
                                                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <stage.icon className="w-5 h-5" />}
                                                </div>

                                                {/* Content */}
                                                <div className={`pt-2 transition-all duration-300 ${isActive ? 'translate-x-2' : ''}`}>
                                                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-1
                             ${isActive ? 'text-teal-700' : 'text-slate-500'}
                             ${isCompleted ? 'text-teal-800' : ''}
                           `}>
                                                        {stage.label}
                                                        {isActive && <span className="ml-2 inline-block w-2 h-2 bg-teal-500 rounded-full animate-pulse" />}
                                                    </h4>
                                                    <p className="text-sm text-slate-500 max-w-md">{stage.desc}</p>

                                                    {/* Active Stage Detail Visuals */}
                                                    {isActive && status === 'processing' && (
                                                        <div className="mt-3 bg-slate-900 rounded-lg p-3 font-mono text-xs text-green-400 shadow-inner">
                                                            <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-1">
                                                                <Activity className="w-3 h-3" />
                                                                <span>Live Process Logs</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                {logs.slice(-3).map((log, i) => (
                                                                    <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
                                                                        <span className="opacity-50 mr-2">{new Date().toLocaleTimeString().split(' ')[0]}</span>
                                                                        {log}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Results */}
                <div className="lg:col-span-6 space-y-6">

                    {/* Result Card */}
                    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col transition-all duration-500 ${status === 'idle' ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Database className="w-5 h-5 text-teal-600" />
                                Live Extraction Results
                            </h2>
                            {status === 'complete' && result?.metadata?.confidence_score && (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-medium border border-green-200">
                                    Confidence: {(result.metadata.confidence_score * 100).toFixed(0)}%
                                </span>
                            )}
                        </div>

                        <div className="flex-1 p-0 overflow-hidden relative min-h-[500px] flex flex-col">
                            {status === 'idle' && (
                                <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-400 p-8 text-center">
                                    <Scan className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Upload a medical document image to begin.</p>
                                </div>
                            )}

                            {status === 'processing' && !result && (
                                <div className="absolute inset-0 flex items-center justify-center flex-col p-8 text-center bg-slate-50/50 backdrop-blur-sm z-10">
                                    <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-6"></div>
                                    <p className="text-slate-800 font-bold text-lg">Analyzing Document...</p>
                                    <p className="text-slate-500 text-sm mt-2 max-w-xs">The Gemini Vision model is identifying text, entities, and clinical context.</p>
                                </div>
                            )}

                            {result && (
                                <div className="h-full overflow-y-auto custom-scrollbar flex-1">
                                    {/* Human Readable Summary Tab */}
                                    <div className="p-6 bg-teal-50/30 border-b border-teal-100">
                                        <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-4">Extracted Highlights</h3>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-white p-3 rounded-lg border border-teal-100 shadow-sm">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                                    <User className="w-3 h-3" /> Patient
                                                </div>
                                                <div className="font-semibold text-slate-800">{result.patient?.name || "Not detected"}</div>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-teal-100 shadow-sm">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                                    <Stethoscope className="w-3 h-3" /> Provider
                                                </div>
                                                <div className="font-semibold text-slate-800">{result.provider?.name || "Not detected"}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {result.medications?.length > 0 ? (
                                                result.medications.map((med: any, i: number) => (
                                                    <div key={i} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-teal-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                                        <div className="mt-1 bg-teal-100 text-teal-600 p-1 rounded">
                                                            <Pill className="w-4 h-4" />
                                                        </div>
                                                        <div className="w-full">
                                                            <div className="flex justify-between items-start">
                                                                <div className="font-bold text-slate-800">{med.name}</div>
                                                                <div className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">{med.dosage}</div>
                                                            </div>
                                                            <div className="text-xs text-slate-500 mt-0.5">{med.frequency} • {med.route}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-slate-400 italic p-4 text-center">No medications detected.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* AI Assistant Section */}
                                    <div className="p-6 border-b border-slate-100 bg-white">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Sparkles className="w-3 h-3 text-amber-500" />
                                            AI Insights
                                        </h3>

                                        {!geminiResult && !isGeminiLoading && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => callGeminiAnalysis('explain')}
                                                    className="flex flex-col items-center justify-center gap-2 p-4 border border-slate-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-center group"
                                                >
                                                    <div className="p-2 bg-teal-100 text-teal-700 rounded-full group-hover:scale-110 transition-transform">
                                                        <MessageSquare className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">✨ Plain English Breakdown</span>
                                                </button>
                                                <button
                                                    onClick={() => callGeminiAnalysis('interactions')}
                                                    className="flex flex-col items-center justify-center gap-2 p-4 border border-slate-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-center group"
                                                >
                                                    <div className="p-2 bg-amber-100 text-amber-700 rounded-full group-hover:scale-110 transition-transform">
                                                        <ShieldCheck className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">✨ Safety & Side Effects</span>
                                                </button>
                                            </div>
                                        )}

                                        {isGeminiLoading && (
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center animate-pulse">
                                                <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
                                                <p className="text-sm font-medium text-slate-600">
                                                    {activeGeminiMode === 'explain' ? 'Generating patient summary...' : 'Checking drug interactions...'}
                                                </p>
                                            </div>
                                        )}

                                        {geminiResult && !isGeminiLoading && (
                                            <div className={`rounded-xl p-4 border text-sm relative animate-in zoom-in-95 duration-200 ${activeGeminiMode === 'explain' ? 'bg-teal-50 border-teal-200' : 'bg-amber-50 border-amber-200'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className={`font-semibold flex items-center gap-2 ${activeGeminiMode === 'explain' ? 'text-teal-800' : 'text-amber-800'}`}>
                                                        {activeGeminiMode === 'explain' ? <MessageSquare className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                                        {activeGeminiMode === 'explain' ? 'Patient Summary' : 'Safety Report'}
                                                    </h4>
                                                    <button onClick={() => setGeminiResult(null)} className="text-slate-400 hover:text-slate-600">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="prose prose-sm max-w-none text-slate-700">
                                                    <p className="whitespace-pre-line leading-relaxed">{geminiResult}</p>
                                                </div>
                                                <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                                                    <Sparkles className="w-3 h-3" /> Powered by Gemini 2.5
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* JSON Code Block */}
                                    <div className="p-6 bg-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Raw JSON Output</h3>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                                                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                            >
                                                Copy JSON
                                            </button>
                                        </div>
                                        <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed shadow-inner">
                                            {JSON.stringify(result, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* VOICE ASSISTANT UI */}
                        {result && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-6 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-white flex justify-between items-center">
                                    <h2 className="text-lg font-semibold flex items-center gap-2 text-teal-900">
                                        <Mic className="w-5 h-5 text-teal-600" />
                                        Voice Assistant
                                    </h2>
                                    {isSpeaking && (
                                        <div className="flex items-center gap-2 text-xs text-teal-600 font-medium animate-pulse">
                                            <Volume2 className="w-4 h-4" />
                                            Speaking...
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 bg-slate-50/50 min-h-[200px] max-h-[400px] overflow-y-auto flex flex-col gap-4">
                                    {chatHistory.length === 0 && (
                                        <div className="text-center text-slate-400 py-8 text-sm">
                                            <p>Tap the microphone to ask questions about your results.</p>
                                            <p className="mt-1">"What is this medication for?"</p>
                                        </div>
                                    )}
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                                ? 'bg-teal-600 text-white rounded-br-none'
                                                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isListening && (
                                        <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
                                            <div className="bg-teal-50 text-teal-800 border-teal-200 border rounded-2xl rounded-br-none px-4 py-3 text-sm flex items-center gap-2">
                                                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                                                {voiceTranscript || "Listening..."}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-slate-100 bg-white flex justify-center">
                                    <button
                                        onClick={toggleListening}
                                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isListening
                                            ? 'bg-red-500 hover:bg-red-600 text-white scale-110 ring-4 ring-red-100'
                                            : 'bg-teal-600 hover:bg-teal-700 text-white hover:scale-105 shadow-teal-200'
                                            }`}
                                    >
                                        {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 mt-12 bg-white">
                <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center text-sm text-slate-500">
                    <p>© 2024 MediParse AI Solutions. All rights reserved.</p>
                    <div className="flex gap-4">
                        <span>Privacy Policy</span>
                        <span>HIPAA Compliance</span>
                        <span>Security</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
