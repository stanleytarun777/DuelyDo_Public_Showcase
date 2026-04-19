# DuelyDo — AI-Powered Academic Task Manager
Get your full Semester organized in under 60 seconds. 
### [🚀 Live Demo](https://duelydo-p93h7wj2z-stanleys-projects-4078d62d.vercel.app/) 

[![DuelyDo Banner](Images/DuelyDo_Banner.png)](https://github.com/stanleytarun777/DuelyDo_Public_Showcase)

DuelyDo is an AI-powered academic productivity system that transforms unstructured course materials into structured, actionable tasks. By extracting assignments, exams, and deadlines from documents such as syllabi, notes, and academic files, DuelyDo provides students with a centralized dashboard to manage their workload efficiently.

DuelyDo addresses a common problem in academic workflows where information is scattered across platforms like Canvas, Syllabus, email, PDFs, and personal notes. Instead of manually tracking assignments and deadlines, users can upload course materials and receive a fully structured task list automatically, reducing planning overhead and improving execution.

Key capabilities include document-to-task extraction from PDFs, DOCX, and text files, a centralized dashboard for managing assignments and deadlines, a calendar view for visualizing upcoming workload, and analytics for tracking productivity and workload distribution. The system uses AI to interpret real academic language such as “Week 5,” “TBA,” and implicit deadlines, while maintaining secure authentication and persistent storage through Supabase.
DuelyDo also incorporates safety and content moderation mechanisms aligned with modern AI system standards. 


| Dashboard | Calendar | Analytics |
|-----------|----------|-----------|
| ![Dashboard](Images/Dashboard.png) | ![Calendar](Images/Calendar.png) | ![Analytics](Images/Analytics.png) |

System architecture follows a simple API-driven pipeline:

User → React Frontend (Vite + Nginx)  
→ POST /api/extract (multipart upload)  
→ FastAPI Backend (Python)  
→ AI Processing Layer (Claude API)  
→ Structured Task Output (JSON)  
→ Supabase (Auth + PostgreSQL Database)

The backend parses uploaded documents, applies AI-based extraction, normalizes the output into structured task data, and persists it for frontend rendering across dashboard, calendar, and analytics views.

The application is built using React 18 and Vite for the frontend, FastAPI with Python 3.12 for the backend, and Anthropic Claude API for AI processing. Supabase is used for authentication and PostgreSQL database management, while pypdf and python-docx handle document parsing. Deployment is containerized using Docker, Docker Compose, and Nginx.

Project structure:

DuelyDo_Public_Showcase/  
├── Frontend/  
│   ├── src/ (components, utilities, application layout)  
│   ├── Dockerfile  
│   ├── nginx.conf  
│   └── package.json  
├── Backend/  
│   ├── App/ (API routes, models, configuration, services)  
│   ├── Dockerfile  
│   └── requirements.txt  
├── Images/  
└── docker-compose.yml  

To run locally, ensure Node.js (v18+), Python (3.10+), and Docker are installed. Clone the repository:

git clone https://github.com/stanleytarun777/DuelyDo_Public_Showcase.git  
cd DuelyDo_Public_Showcase  

Create a backend `.env` file:

ANTHROPIC_API_KEY=your_api_key  
SUPABASE_URL=your_project_url  
SUPABASE_ANON_KEY=your_anon_key  

Start the application:

docker-compose up --build  

Frontend will run on http://localhost:8080 and the backend API on http://localhost:8000.

This repository is a public showcase intended for demonstration and evaluation. Core AI extraction logic, production-level configurations, and certain integrations are abstracted or maintained in a private repository.

The system is designed with a focus on reducing cognitive load for students by eliminating manual planning. Instead of requiring users to input tasks, DuelyDo interprets academic content and converts it into a structured workflow automatically.

Current limitations include dependency on document clarity for extraction accuracy, incomplete real-time integrations with platforms like Canvas and Gmail, and simplified backend components for demonstration purposes.

Future development includes integration with Canvas LMS, Gmail, and Google Calendar, improved AI extraction accuracy, mobile application support, a conversational academic assistant, and advanced workload prioritization features.

Author: Stanley Nyford  
Computer Information Systems - Computer Science, Nicholls State University  

License: MIT License © DuelyDo  
