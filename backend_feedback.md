# AI Exam Generation - Backend & Architecture Feedback

Here is a summary of the current limitations observed in the Exam Generation feature, along with architectural recommendations to resolve them. 

---

## Issue 1: AI ignores uploaded PDFs and relies only on the "Topic"
**Symptom:** When a teacher uploads a PDF to a section (e.g., RxJS) but enters a "Topic" in the generation form that is unrelated to the PDF, the AI generates the exam based *only* on the Topic, completely ignoring the PDF context. 

**Root Cause:**
- **Missing RAG Pipeline:** The backend is likely not extracting the text from the uploaded PDFs in the given `sectionId` and injecting it into the LLM prompt.
- **Prompt Priority:** Even if the PDF text is injected, LLMs prioritize explicit user instructions (the Topic). If the Topic contradicts the PDF, the LLM will follow the Topic.

**Recommended Backend Solution:**
1. **Implement RAG (Retrieval-Augmented Generation):** When a PDF is uploaded, chunk and embed the text into a Vector DB. When generating an exam, use the requested `Topic` to semantically search the Vector DB for the most relevant PDF chunks.
2. **Strict Prompt Engineering:** Update the system prompt to enforce context strictly. Example: 
   > *"You are an examiner. Generate an exam STRICTLY based on the provided PDF document chunks. Use the requested Topic only as a specific angle for the questions extracted from the PDF. If the requested Topic has nothing to do with the PDF, refuse to generate the exam."*

---

## Issue 2: Generating exams with >25 questions fails ("فشل الإنشاء")
**Symptom:** Generating an exam with 20 questions works perfectly. However, requesting 50 or 100 questions consistently causes the generation tracker to fail after about 100 seconds. 

**Root Cause:**
- **Output Token Limits:** LLMs (like GPT-4) have a maximum output token limit (usually ~4,096 tokens). Generating a massive JSON array of 50-100 questions with choices and answers exceeds this physical limit, causing the LLM to cut off mid-sentence. When the backend tries to deserialize this truncated JSON, it crashes.
- **HTTP Timeouts:** Generating 50+ questions takes 1-2 minutes. The backend's HTTP client or the server's load balancer likely hits a standard 60s or 100s timeout before the LLM finishes responding, causing the connection to drop.

**Recommended Backend Solution:**
Instead of requesting all questions in a single LLM prompt, the backend must implement a **Chunking/Batching Loop**:
1. Receive the frontend request for 100 questions.
2. Request a small batch (e.g., 10 questions) from the LLM.
3. Save the response.
4. Loop this process 10 times asynchronously.
5. Once all batches are successfully generated, merge them into a single Exam object and push the `Completed` status via SignalR.
*(Note: The frontend is already perfectly designed to wait on the loading screen for as long as this backend loop takes).*
