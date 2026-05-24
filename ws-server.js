const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// 1. Load environment variables from .env.local manually
if (fs.existsSync(path.join(__dirname, '.env.local'))) {
  const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// 2. Connect to MongoDB database
mongoose.connect(MONGODB_URI, {
  bufferCommands: false // Disable buffering so we fail fast if connection is not active
})
  .then(() => console.log('WebSocket DB connected successfully!'))
  .catch(err => console.error('WebSocket DB connection failed:', err));

// 3. Define Mongoose Schemas inline to prevent module conflicts in standalone node server
const QuestionDetailSchema = new mongoose.Schema({
  type: { type: String, required: true },
  count: { type: Number, required: true },
  marks: { type: Number, required: true },
});

const QuestionSchema = new mongoose.Schema({
  section: { type: String, required: true },
  type: { type: String, required: true },
  questionText: { type: String, required: true },
  options: [{ type: String }],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  marks: { type: Number, required: true },
  answer: { type: String, required: true },
});

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  group: { type: String, required: true, default: 'Class X-A Science' },
  assignedDate: { type: String, required: true },
  dueDate: { type: String, required: true },
  questionsCount: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  status: { type: String, enum: ['In Progress', 'Graded'], default: 'In Progress' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionsDetails: [QuestionDetailSchema],
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// 4. Start WebSocket Server on port 3001
const wss = new WebSocketServer({ port: 3001 });
console.log('VedaAI WebSocket completions server is running on ws://localhost:3001');

wss.on('connection', (ws, req) => {
  console.log('Client connected to WebSocket server.');

  // Parse session cookie from upgrade handshake headers
  let userId = null;
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const sessionCookie = cookieHeader.split(';').find(c => c.trim().startsWith('veda_session='));
    if (sessionCookie) {
      try {
        const base64Token = sessionCookie.split('=')[1].trim();
        const decodedToken = decodeURIComponent(base64Token);
        const sessionUser = JSON.parse(Buffer.from(decodedToken, 'base64').toString('utf8'));
        userId = sessionUser.id;
        console.log(`Authenticated Socket Session: ${sessionUser.name} (${userId})`);
      } catch (err) {
        console.error('Failed to parse veda_session socket token:', err);
      }
    }
  }

  ws.on('message', async (message) => {
    try {
      const payload = JSON.parse(message);
      
      if (payload.action === 'generate_assignment') {
        // Fail-fast check for database connection
        if (mongoose.connection.readyState !== 1) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Database is not connected. If you are using MongoDB Atlas, please check if your current IP address is whitelisted in your Atlas Network Access settings.' 
          }));
          return;
        }

        const { title, dueDate, additionalInfo, questions } = payload.data;

        // Strict validation
        if (!title || !title.trim() || !dueDate) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Validation failed: Title and Due Date are required.' 
          }));
          return;
        }

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (q.count <= 0 || isNaN(q.count) || q.marks <= 0 || isNaN(q.marks)) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Validation failed: Question counts and marks must be positive integers greater than 0.' 
            }));
            return;
          }
        }

        // Retrieve userId from db fallback if cookie not set (for standalone dev testing)
        let resolvedUserId = userId;
        if (!resolvedUserId) {
          const fallbackUser = await User.findOne({});
          if (fallbackUser) {
            resolvedUserId = fallbackUser._id.toString();
            console.log(`Fallback Socket User selected: ${fallbackUser.name}`);
          } else {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'No registered educators found. Please sign up first!' 
            }));
            return;
          }
        }

        ws.send(JSON.stringify({ type: 'progress', progress: 20, status: 'Assembling prompt based on CBSE & DPS Bokaro standards...' }));

        // 5. Formulate System Prompt
        const systemPrompt = `You are VedaAI, an expert curriculum designer helping teachers at Delhi Public School (DPS) Bokaro create premium, structured question papers for assessments.
Generate a structured question paper based strictly on the user instructions.

Exam Guidelines (DPS Bokaro & CBSE Standards):
1. The curriculum follows standard CBSE guidelines. Questions should test deep conceptual and logical understanding, not simple rote memory.
2. Group the question matrix into consecutive sections: Section A (for Multiple Choice Questions), Section B (for Short Questions), Section C (for Diagram/Graph-Based Questions or Numerical Problems), and Section D (for Long Questions).
3. If the user does not specify a clear curriculum subject or file, generate a high-standard question paper based on common knowledge and history of Delhi Public School (DPS) Bokaro Steel City. Topics can cover its establishment year (1987), motto ("Service Before Self"), Sector-4 location, CBSE affiliation, top-tier academic and facilities standing, and its well-known science/math paper standards.
4. For each question:
   - Provide a detailed correct answer or step-by-step solution in the "answer" field. This is critical to construct the Answer Key at the end of the A4 paper.
   - For Multiple Choice Questions, options must be populated as an array of 4 distinct choices, and the "answer" field must state the full text of the correct choice.
   - For non-MCQ formats, the "options" field must be omitted or left blank.
   - Allocate difficulty ("Easy", "Medium", or "Hard") and exact marks.

You MUST return a valid JSON object matching this schema exactly:
{
  "questions": [
    {
      "section": "Section A" | "Section B" | "Section C" | "Section D",
      "type": "Multiple Choice Questions" | "Short Questions" | "Diagram/Graph-Based Questions" | "Numerical Problems" | "Long Questions" | "Fill in the Blanks",
      "questionText": "The question content",
      "options": ["Choice A", "Choice B", "Choice C", "Choice D"], // ONLY for MCQs, omit otherwise
      "difficulty": "Easy" | "Medium" | "Hard",
      "marks": number,
      "answer": "Detailed solution or correct answer key text..."
    }
  ]
}
Return ONLY valid JSON. Do not include markdown code block backticks (e.g. \`\`\`json) in your response.`;

        const userPrompt = `Generate a question paper for:
Title: ${title}
Due Date: ${dueDate}
Additional Instructions: ${additionalInfo || 'None provided.'}

Question Matrix Requirements:
${questions.map(q => `- ${q.count} x ${q.type} (${q.marks} Marks each)`).join('\n')}

Generate the questions matching these exact counts. Divide them cleanly into Sections (Section A, B, etc.).`;

        ws.send(JSON.stringify({ type: 'progress', progress: 45, status: 'Communicating with Gemini API (gemini-2.5-flash)...' }));

        try {
          if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not defined in .env.local');
          }

          // 6. Connect directly to Gemini API using native fetch
          const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: [
                {
                  role: 'user',
                  parts: [{ text: userPrompt }]
                }
              ],
              generationConfig: {
                responseMimeType: 'application/json'
              }
            })
          });

          if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            throw new Error(`Gemini API responded with status ${geminiResponse.status}: ${errorText}`);
          }

          const completionResult = await geminiResponse.json();
          const rawCandidate = completionResult?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawCandidate || typeof rawCandidate !== 'string') {
            throw new Error('Gemini response did not contain JSON text in candidates[0].content.parts[0].text');
          }
          let rawContent = rawCandidate.trim();

          // Clean markdown code blocks from response if present
          if (rawContent.startsWith('```')) {
            rawContent = rawContent.replace(/^```json\s*/, '').replace(/```$/, '').trim();
          }

          ws.send(JSON.stringify({ type: 'progress', progress: 75, status: 'AI question synthesis complete! Balancing marks allocations...' }));

          const parsedData = JSON.parse(rawContent);
          const generatedQuestions = parsedData.questions;

          if (!generatedQuestions || !Array.isArray(generatedQuestions)) {
            throw new Error('LLM did not return a valid list of questions matching our JSON format.');
          }

          ws.send(JSON.stringify({ type: 'progress', progress: 90, status: 'Saving structured question sheets to MongoDB...' }));

          // 7. Calculate aggregate stats
          const totalQuestionsCount = generatedQuestions.length;
          const grandTotalMarks = generatedQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

          const formattedAssignedDate = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '-');

          const formattedDueDate = new Date(dueDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '-');

          // 8. Write to MongoDB
          const newAssignment = await Assignment.create({
            title,
            group: 'Class X-A Science',
            assignedDate: formattedAssignedDate,
            dueDate: formattedDueDate,
            questionsCount: totalQuestionsCount,
            totalMarks: grandTotalMarks,
            status: 'In Progress',
            userId: new mongoose.Types.ObjectId(resolvedUserId),
            questionsDetails: questions,
            questions: generatedQuestions
          });

          console.log(`Saved new generated assignment: "${title}" with ${totalQuestionsCount} questions.`);

          ws.send(JSON.stringify({ type: 'progress', progress: 98, status: 'Finalizing download payloads...' }));

          setTimeout(() => {
            ws.send(JSON.stringify({ 
              type: 'completed', 
              data: newAssignment 
            }));
          }, 800);

        } catch (apiErr) {
          console.error('Gemini completion generation failed:', apiErr);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: `Gemini AI completion failed: ${apiErr.message || 'Make sure your API key is active.'}` 
          }));
        }
      }
    } catch (err) {
      console.error('Failed to parse WebSocket incoming frame:', err);
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to process request.' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket server.');
  });
});
