const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");

dotenv.config();

const app = express();
const port = 3000;

const messages = [];
const gemini_api_key = process.env.GEMINI_API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);
const geminiConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};

const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-pro",
  geminiConfig,
});

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

// Render HTML File
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "templates/index.html"));
});

app.post("/api", async function (req, res, next) {
  try {
    const input = req.body.input;
    messages.push({ role: "user", content: input });
    console.log(messages);

    // Generate response using Google Generative AI
    const prompt = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");
    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();

    // Add the model's response to the conversation history
    messages.push({ role: "assistant", content: response });

    res.json({ success: true, message: response });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
