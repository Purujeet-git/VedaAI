# VedaAI Educator Hub

VedaAI Educator Hub is a full-stack Next.js application that provides an intuitive interface for educators to manage class assignments. It features AI-powered question paper generation that automatically aligns with school curriculum standards (like CBSE).

## 🚀 Features
- **AI Assessment Creator**: Dynamic AI generation of questions across various formats (MCQ, Short Answer, Long Answer) using Google Gemini.
- **WebSocket Streaming**: Real-time progress updates when compiling long assessments.
- **A4 PDF Export**: Generate printable, strictly formatted question papers instantly using `html2pdf.js`.
- **Responsive UI**: Glassmorphic, completely mobile-responsive sidebar and beautifully rendered modern web-cards.
- **MongoDB Database**: Persistent storage of assignments and user data.

## 🛠️ Tech Stack
- **Frontend**: Next.js 16, React 19, TailwindCSS v4, Zustand (State Management), Lucide React (Icons).
- **Backend**: Next.js API Routes, Node.js + `ws` (WebSockets), Mongoose (MongoDB ORM).
- **AI**: Google Gemini API integration.

## ⚙️ Local Installation & Setup

Follow these steps to run the project locally.

### 1. Prerequisites
Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [Git](https://git-scm.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/Purujeet-git/VedaAI.git
cd VedaAI
```

### 3. Install Dependencies
Run the following command in the root directory to install all required packages:
```bash
npm install
```

### 4. Setup Environment Variables
Create a file named `.env.local` in the root directory. You can copy the template from `.env.example`:
```bash
cp .env.example .env.local
```
Then, populate the variables inside `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Make sure your IP address is whitelisted in MongoDB Atlas if you are using a cloud database!)*

### 5. Start the Application

This project requires **two** separate servers to be running simultaneously: the Next.js Frontend/API server, and the WebSocket generation server.

Open two separate terminal windows.

**Terminal 1 (Start the Next.js Dev Server):**
```bash
npm run dev
```

**Terminal 2 (Start the WebSocket Server):**
```bash
npm run ws:start
```

### 6. Open the App
Once both servers are running smoothly, open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)

You can now sign up, log in, and start creating customized AI assessments!
