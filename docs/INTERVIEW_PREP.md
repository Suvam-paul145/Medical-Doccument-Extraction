# MediParse.AI — Interview Prep Cheat Sheet

> Quick-reference bullet points for explaining **what you built, why, and how**.

---

## 1. Core Ideation (The "What & Why")

- **Problem**: Medical documents (prescriptions, lab reports, clinical notes) are **unstructured images** — hard to digitize, search, or integrate into Electronic Health Records (EHR).
- **Solution**: MediParse.AI takes a **photo of any medical document** and instantly extracts **structured JSON data** using Google's Gemini 2.5 Vision API.
- **Beyond OCR**: It doesn't just read text — it **understands medical context**:
  - Identifies drugs, dosages, diagnosis codes
  - Maps them to **medical standards** (RxNorm for drugs, ICD-10 for diagnoses)
  - Translates complex medical jargon into **plain English** for patients
  - Checks for **drug-drug interactions** as a safety layer
- **Target Users**: Patients who want to understand their prescriptions, clinics digitizing records, healthcare developers building EHR integrations.

---

## 2. Architecture — The 6-Stage Processing Pipeline

The app processes every document through a **sequential pipeline** visualized in real-time to the user:

```
Image Upload → Preprocessing → OCR → Entity Recognition → Normalization → JSON Output
```

| Stage | What Happens | How |
|-------|-------------|-----|
| **1. Ingestion** | Validate file format (PNG/JPG/WEBP), create preview | React drag-and-drop + FileReader API |
| **2. Preprocessing** | Optimize contrast, reduce noise, deskew | Canvas API (simulated stage) |
| **3. OCR Extraction** | Read raw text from the image | Gemini 2.5 Vision API (`generateContent`) |
| **4. Entity Recognition (NER)** | Identify drugs, dosages, patient info, diagnosis codes | Gemini NLP (same API call, prompt-driven) |
| **5. Normalization** | Map raw text to RxNorm & ICD-10 standards | Gemini Knowledge Graph (prompt-driven) |
| **6. JSON Construction** | Output clean, structured JSON | JSON.parse on the LLM response |

> **Key point**: Stages 3–5 happen in a **single Gemini API call** — the pipeline visualization is for UX clarity. The prompt instructs the LLM to perform OCR + NER + normalization all at once.

---

## 3. LLM Architecture Breakdown (How Gemini Works Here)

### 3.1 Model Used
- **Google Gemini 2.5 Flash** — a multimodal (vision + language) model
- Accessed via **REST API** (`generativelanguage.googleapis.com/v1beta`)
- No SDK — direct `fetch()` calls to the API endpoint

### 3.2 How the LLM Is Called

```
User uploads image
        ↓
Image → Base64 encoded via FileReader API
        ↓
Prompt + Base64 image sent to Gemini API
        ↓
LLM returns structured JSON
        ↓
JSON.parse → render in UI
```

### 3.3 Three Distinct LLM Use Cases

| Use Case | Prompt Strategy | Input | Output |
|----------|----------------|-------|--------|
| **Extraction** | "You are a medical document extractor. Extract into this JSON schema..." | Image (base64) + prompt | Structured JSON (patient, meds, diagnosis) |
| **Patient Summary** | "You are a compassionate medical assistant. Explain in simple English..." | Extracted JSON as context | Plain-English bullet-point summary |
| **Drug Interaction Check** | "You are a clinical pharmacist AI. Check for drug-drug interactions..." | Extracted JSON as context | Safety assessment report |

### 3.4 Prompt Engineering Techniques Used
- **Role assignment**: Each prompt starts with a persona ("You are a medical document extractor")
- **Strict schema enforcement**: The extraction prompt includes the exact JSON schema the LLM must follow
- **Hallucination guard**: Prompt says "If a field is not present or illegible, use null. Do not hallucinate data."
- **Output format control**: "Return ONLY raw JSON. No markdown formatting."
- **Context injection**: For follow-up queries (summary, interactions), the extracted JSON is passed as context

### 3.5 Multimodal Input
- The image is converted to **base64** and sent as an `inlineData` part alongside the text prompt
- Gemini processes both the **visual content** (reading the document) and the **text instruction** (what to extract) simultaneously
- This is the key differentiator — traditional OCR (Tesseract) does text recognition only; Gemini **understands** the medical context

---

## 4. Voice Assistant Architecture

- Uses **Web Speech API** (browser-native, no external service)
- **Speech-to-Text**: `SpeechRecognition` captures the user's spoken question
- **AI Processing**: The transcript + extracted medical data are sent to Gemini as a conversational prompt
- **Text-to-Speech**: `SpeechSynthesisUtterance` reads the AI response aloud
- **Flow**: Speak → Transcribe → Gemini API → AI Answer → Speak Back

---

## 5. Key Technical Decisions

- **No backend server** — 100% client-side React app; API key is exposed via Vite's `envPrefix` config
- **Single-page architecture** — one main component (`MedicalDocExtractor.tsx`, ~800 lines) handles everything
- **No OCR library** (no Tesseract) — relies entirely on Gemini Vision for text extraction + understanding
- **Real-time pipeline animation** — uses `setInterval` to visually step through stages while the API call runs in the background
- **Deployed on Vercel** — zero-config deployment with environment variable for the API key

---

## 6. Tech Stack (Quick Reference)

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| AI/LLM | Google Gemini 2.5 Flash (Vision API) |
| Voice | Web Speech API (native) |
| Icons | Lucide React |
| Deployment | Vercel |

---

## 7. What Makes This Project Stand Out (Talking Points)

- **Multimodal AI in practice**: Uses vision + language capabilities of a single model — no chaining multiple services
- **Prompt-as-architecture**: The processing pipeline is primarily driven by **prompt engineering**, not traditional code logic
- **Medical domain knowledge**: Prompts are tailored for healthcare (RxNorm, ICD-10, drug interactions)
- **Safety-first design**: Includes drug interaction checking and hallucination guards in prompts
- **Full UX story**: Not just an API wrapper — includes drag-and-drop upload, real-time progress visualization, voice assistant, and patient-friendly summaries

---

## 8. Potential Interview Questions & Quick Answers

**Q: Why Gemini instead of GPT-4 or a dedicated OCR tool?**
> Gemini 2.5 is natively multimodal — it processes images and text in one call. No need to chain Tesseract OCR → separate NLP model. Fewer moving parts, lower latency.

**Q: How do you handle hallucinations?**
> The prompt explicitly instructs: "If a field is not present or illegible, use null. Do not hallucinate data." Plus, confidence scores are part of the output schema.

**Q: Why no backend?**
> For this prototype/demo, a client-side approach keeps it simple and deployable on Vercel with zero infrastructure. In production, I'd move the API key server-side for security.

**Q: How would you scale this?**
> Add a backend (Node/Express or serverless functions) to proxy API calls and secure keys. Add a database for storing extraction history. Support PDF uploads via pdf.js. Add multi-language support.

**Q: What's the accuracy like?**
> Depends on image quality. Gemini Vision handles most printed prescriptions well. The confidence_score in the output helps flag low-quality extractions. Handwritten documents are harder.
