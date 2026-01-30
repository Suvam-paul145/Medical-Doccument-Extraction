# Copilot Instructions for MediParse.AI

## Project Overview

MediParse.AI is a medical document extraction and analysis application powered by Google's Gemini 2.5 Vision API. The application processes medical documents (prescriptions, lab reports, clinical notes) to extract structured JSON data with context-aware insights.

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 4.x
- **State Management**: React Hooks (useState, useEffect)
- **AI Integration**: Google Gemini 2.5 Vision API
- **Icons**: Lucide React
- **Voice**: Web Speech API

## Project Structure

```
src/
├── App.tsx              # Main application component
├── App.css              # Application-specific styles
├── MedicalDocExtractor.tsx  # Core extraction component
├── main.tsx             # Application entry point
├── index.css            # Global styles
└── assets/              # Static assets
```

## Development Commands

- `npm run dev` - Start development server (Vite at http://localhost:5173)
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build locally

## Coding Conventions

### TypeScript

- **Strict Mode**: Use strict typing where possible
- **Avoid `any`**: Use proper type definitions or interfaces
- **Type Imports**: Use type imports for type-only dependencies
- **Target**: ES2022 with DOM APIs

### React

- **Component Style**: Use functional components with Hooks (no class components)
- **State Management**: Use `useState` and `useEffect` hooks
- **JSX**: Use React 19's JSX transform (`react-jsx`)
- **Props**: Define TypeScript interfaces for all component props

### Styling

- **Primary**: Use Tailwind CSS utility classes
- **Custom CSS**: Avoid custom CSS in `index.css` unless absolutely necessary
- **Responsive**: Follow mobile-first responsive design patterns
- **Consistency**: Maintain visual consistency with the existing design system

### Code Quality

- **ESLint**: Code must pass `npm run lint` without errors
- **TypeScript**: Code must compile without errors (`tsc -b`)
- **Imports**: Use consistent import order (React, external libraries, internal components)
- **Comments**: Add JSDoc-style comments for complex logic and component interfaces

### File Naming

- **Components**: PascalCase (e.g., `MedicalDocExtractor.tsx`)
- **Utilities**: camelCase for utility files
- **Assets**: lowercase with hyphens

## Environment Variables

- `GEMINI_API_KEY` - Required for AI functionality (client-side exposed via `envPrefix` in vite.config.ts)

## Architecture Principles

### Processing Pipeline

The application follows a 6-stage processing pipeline:
1. **Ingestion** - File validation and upload
2. **Preprocessing** - Image optimization
3. **OCR Extraction** - Text recognition via Gemini Vision
4. **Entity Recognition** - Medical entity identification
5. **Normalization** - Mapping to medical standards (RxNorm, ICD-10)
6. **JSON Construction** - Structured output generation

### Key Features to Preserve

- Drag-and-drop file upload interface
- Real-time processing visualization
- Voice assistant integration
- Patient summary generation
- Drug interaction checking
- Structured JSON export

## Git Conventions

- **Commit Messages**: Use conventional commits format
  - `feat: add new feature`
  - `fix: resolve bug`
  - `docs: update documentation`
  - `style: formatting changes`
  - `refactor: code restructuring`
  - `test: add or update tests`

## Testing

- Currently no automated testing infrastructure
- Manual testing required:
  1. Start dev server
  2. Test file upload (PNG, JPG, WEBP)
  3. Verify AI extraction works with valid API key
  4. Test voice assistant features
  5. Verify responsive design

## Deployment

- **Platform**: Vercel (configured via `vercel.json`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment**: Remember to set `GEMINI_API_KEY` in Vercel

## Security Considerations

- API keys are exposed client-side (VITE_ prefix)
- Only use API keys meant for client-side access
- Validate and sanitize all user inputs
- Handle medical data with appropriate privacy considerations

## Best Practices for Changes

1. **Minimal Changes**: Make the smallest possible changes to accomplish the task
2. **Preserve Functionality**: Don't break existing features
3. **Test Locally**: Run `npm run dev` and manually verify changes
4. **Lint Before Commit**: Always run `npm run lint` and fix issues
5. **Type Safety**: Ensure TypeScript compilation succeeds
6. **Documentation**: Update README.md if adding significant features
7. **Dependencies**: Avoid adding new dependencies unless necessary

## Common Tasks

### Adding a New Feature
1. Create or modify component in `src/`
2. Follow React functional component pattern
3. Use TypeScript interfaces for props
4. Style with Tailwind CSS utilities
5. Test in browser
6. Lint and build

### Modifying AI Integration
- All Gemini API calls are in `MedicalDocExtractor.tsx`
- Use the `GEMINI_API_KEY` environment variable
- Handle API errors gracefully
- Maintain the processing stage visualization

### Styling Changes
- Use existing Tailwind classes when possible
- Maintain responsive design (mobile-first)
- Follow the existing color scheme and design language
- Test on multiple screen sizes

## Questions or Issues?

- Check `CONTRIBUTING.md` for contribution guidelines
- Review `CODE_OF_CONDUCT.md` for community standards
- Open an issue with the `question` tag if needed
