# DuelyDo | AI-Powered Academic Workflow Engine

> An intelligent orchestration system that transforms unstructured academic data into executable, synchronized workflows using React, FastAPI, and Supabase.

[![DuelyDo Banner](https://github.com/stanleytarun777/DuelyDo_Public_Showcase/blob/main/Images/DuelyDo_Banner.png)](https://github.com/stanleytarun777/DuelyDo_Public_Showcase)

## 🚀 The Engineering Mission
Academic workflows are historically fragmented; deadlines are buried in 10-page PDFs, and expectations are distributed across static documents. **DuelyDo** solves this "information-to-action" gap by implementing an automated extraction pipeline that identifies, structures, and sequences academic tasks with high precision.

---

## 🛠️ Technical Architecture
DuelyDo is built on a modular stack designed for low-latency processing and reliable data persistence:

* **Frontend:** React.js & Tailwind CSS (Cinematic UI/UX with asynchronous state management).
* **Backend:** FastAPI (Python) for high-concurrency API handling and document processing.
* **AI Layer:** Anthropic Claude API integrated via a custom prompt-engineering pipeline for structured JSON task extraction.
* **Database & Auth:** Supabase (PostgreSQL) for real-time data synchronization and secure user session management.
* **Parsing:** Implementation of `PDF.js` and `Mammoth.js` for client-side document preprocessing.

---

## ✨ Core Engineering Capabilities

### 1. Intelligent Schema Mapping
Unlike standard OCR, DuelyDo normalizes inconsistent academic formats into a strict **PostgreSQL schema**. It handles:
* **Relational Mapping:** Linking extracted tasks to specific course IDs and user profiles.
* **Temporal Logic:** Resolving ambiguous dates (e.g., "Due Friday of Week 3") into valid ISO-8601 timestamps.

### 2. Live Assist & Real-Time Sync
The "Assist" panel utilizes a non-blocking UI pattern, allowing users to interact with AI-driven document analysis while the primary task view remains interactive.

### 3. Multi-Format Ingestion Pipeline
Engineered a robust ingestion layer that supports:
* **Unstructured Text:** Email and plain-text syllabus excerpts.
* **Legacy Formats:** Complex multi-column PDF and DOCX parsing.
* **Visual Data:** Image-to-task conversion for handwritten or scanned schedules.

---

## 📈 Performance & Impact (XYZ Method)
* **Workflow Optimization:** Reduced manual task entry time by **~90%** by automating the extraction of dozens of assignments per document.
* **Latency Reduction:** Optimized the Python backend pipeline to achieve **near real-time processing** of multi-page syllabi.
* **Data Integrity:** Implemented a verification layer that significantly reduced extraction hallucinations in complex academic tables.

---

## 🧠 Engineering Challenges & Solutions
* **Challenge:** Managing UI responsiveness during heavy AI processing.
    * **Solution:** Implemented asynchronous polling and optimistic UI updates to maintain a seamless user experience.
* **Challenge:** Interpreting inconsistent date expressions.
    * **Solution:** Developed a relative-date parsing engine that anchors "Week X" strings to the syllabus start-date metadata.
* **Challenge:** Schema normalization from unstructured inputs.
    * **Solution:** Designed a robust JSON-schema enforcement layer between the AI output and the Supabase database.

---

## 🗺️ Roadmap
* [ ] **LMS Integration:** OAuth-based sync with Canvas, Blackboard, and Moodle.
* [ ] **Mobile Ecosystem:** Dedicated iOS/Android applications using React Native.
* [ ] **Calendar Orchestration:** Bidirectional sync with Google and Apple Calendars.

---

## 🔒 Repository Notice
This public showcase represents the system design and frontend architecture. Core proprietary processing logic and deployment configurations are maintained in a private repository for security and scalability.

---
**License:** MIT © [DuelyDo](https://github.com/stanleytarun777/DuelyDo_Public_Showcase)
