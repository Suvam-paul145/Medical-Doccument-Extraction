# MediParse.AI 🏥 🤖

<div align="center">
  <img src="docs/readme/banner.png" alt="MediParse.AI Banner" width="100%" />
</div>

> **Next-Gen Medical Document Extraction & Analysis powered by Gemini 2.5**  
> Live demo: https://medi-parse-your-personal-medical-as.vercel.app/

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-medi--parse-blueviolet)](https://medi-parse-your-personal-medical-as.vercel.app/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5-8E75B2)](https://deepmind.google/technologies/gemini/)

## 📋 Overview

**MediParse.AI** is an advanced open-source tool designed to bridge the gap between unstructured medical documents and digital health records. Leveraging the power of Google's **Gemini 2.5 Vision API**, it instantly analyzes images of prescriptions, lab reports, and clinical notes to extract structured JSON data.

Beyond simple OCR, MediParse provides **context-aware insights**, translating complex medical jargon into plain English for patients and identifying potential drug interactions for healthcare providers.

## ✨ Key Features

*   **📄 Smart Document Ingestion**: Drag-and-drop interface for seamless upload of medical images (PNG, JPG, WEBP).
*   **🧠 AI-Powered Extraction**: Utilizes Gemini Vision to identify text, entities, and clinical context with high precision.
*   **🔍 Visual Processing Pipeline**: Real-time visualization of the extraction process (Preprocessing -> OCR -> NER -> Normalization).
*   **🗣️ Voice Assistant**: Integrated voice capabilities to query your medical data hands-free (e.g., *"What is this medication for?"*).
*   **🛡️ Safety & Insights**:
    *   **Patient Summary**: Converts medical data into simple, reassuring language.
    *   **Interaction Check**: Analyzes medications for potential drug-drug interactions and safety warnings.
*   **💾 Structured Output**: Exports clean, standardized JSON ready for EHR integration.

## 🏗️ Architecture & Pipeline

MediParse follows a multi-stage processing pipeline to ensure accuracy and data integrity.

| Stage | Icon | Description | Technology |
| :--- | :---: | :--- | :--- |
| **1. Ingestion** | 📤 | Validates file format and prepares secure upload. | React Dropzone |
| **2. Preprocessing** | 🔍 | Optimizes image contrast, reduces noise, and deskews. | Canvas API / OpenCV (Simulated) |
| **3. OCR Extraction** | 📝 | Optical Character Recognition to read raw text. | Gemini Vision API |
| **4. Entity Recognition** | 🧠 | Identifies drugs, dosages, and patient entities. | Gemini NLP |
| **5. Normalization** | 🗄️ | Maps raw text to RxNorm and ICD-10 standards. | Gemini Knowledge Graph |
| **6. JSON Construction** | 📄 | Generates the final structured output. | JSON Parser |

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 | The core UI library. |
| **Build Tool** | Vite | Fast development server and bundler. |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework for modern design. |
| **Language** | TypeScript | Type-safe JavaScript for robust code. |
| **AI Model** | Google Gemini 2.5 | Vision and Language model for extraction and analysis. |
| **Icons** | Lucide React | Beautiful, consistent icon set. |
| **Voice** | Web Speech API | Native browser API for speech recognition and synthesis. |

## 📸 Gallery

<div align="center">
  <img src="docs\readme\main-context.png" alt="App Interface" width="800" />
  <p><em>Main Dashboard with Extraction Results</em></p>
</div>

<br />

<div align="center">
  <div style="display: flex; justify-content: center; gap: 20px;">
    <img src="docs\readme\voice-image.png" alt="Voice Assistant" width="400" />
    <img src="docs\readme\ai insights.png" alt="AI Insights" width="400" />
  </div>
  <p><em>Voice Assistant & AI Safety Analysis</em></p>
</div>

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn
*   A Google Cloud API Key with access to **Gemini API**.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Suvam-paul145/Medical-Doccument-Extraction.git
    cd Medical-Doccument-Extraction
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to `http://localhost:5173`.

## ☁️ Deploy on Vercel

Deploy MediParse.AI to [Vercel](https://vercel.com) for a fast, production-ready hosting solution.

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Suvam-paul145/Medical-Doccument-Extraction&env=GEMINI_API_KEY&envDescription=Your%20Google%20Gemini%20API%20Key&project-name=mediparse-ai&repository-name=mediparse-ai)

### Manual Deployment Steps

1.  **Push your code to GitHub** (if not already done)

2.  **Go to [Vercel](https://vercel.com)** and sign in with your GitHub account

3.  **Import your repository**
    - Click **"Add New..."** → **"Project"**
    - Select the `Medical-Doccument-Extraction` repository
    - Click **"Import"**

4.  **Configure Build Settings** (auto-detected, but verify):

    | Setting | Value |
    | :--- | :--- |
    | **Framework Preset** | `Vite` |
    | **Build Command** | `npm run build` |
    | **Output Directory** | `dist` |
    | **Install Command** | `npm install` |

5.  **Add Environment Variables**
    - Click **"Environment Variables"**
    - Add the following:
      | Name | Value |
      | :--- | :--- |
      | `GEMINI_API_KEY` | `your_actual_api_key_here` |
    
    > ⚠️ **Note**: The `GEMINI_API_KEY` is exposed in the client bundle. Only use API keys meant for client-side access.

6.  **Deploy**
    - Click **"Deploy"**
    - Wait for the build to complete (usually 1-2 minutes)
    - Your app will be live at `https://your-project-name.vercel.app`

### Vercel CLI Deployment

If you prefer using the command line:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (follow the prompts)
vercel

# For production deployment
vercel --prod
```

### Build Command Summary

| Command | Description |
| :--- | :--- |
| `npm install` | Install all dependencies |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run dev` | Start development server |
| `npm run preview` | Preview production build locally |

## 🗺️ Roadmap

- [x] Image Upload & Validation
- [x] Gemini Vision Integration
- [x] Voice Assistant
- [ ] PDF Document Support
- [ ] Local History Storage
- [ ] Export to PDF/CSV
- [ ] Multi-language Support

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Made by <a href="https://github.com/Suvam-paul145">Suvam Paul</a></p>
</div>
