import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side lazy Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(overrideKey?: string): GoogleGenAI | null {
  const key = overrideKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasServerGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Chat completion endpoint
app.post("/api/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, systemInstruction, temperature, apiKey: clientApiKey } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Invalid messages format. Expected non-empty array." });
      return;
    }

    const ai = getGemini(clientApiKey);
    if (!ai) {
      res.status(401).json({
        error: "No Gemini API key available. Configure GEMINI_API_KEY on the server or provide an API key in the AI Studio settings.",
      });
      return;
    }

    // Convert messages to history and latest prompt
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemInstruction || "You are ToolNest Pro AI Assistant, a concise, knowledgeable, and helpful productivity AI.",
        temperature: typeof temperature === "number" ? Math.min(Math.max(temperature, 0), 2) : 0.7,
      },
    });

    const text = response.text || "No response generated.";
    res.json({ text, model: "gemini-2.5-flash" });
  } catch (error: unknown) {
    console.error("AI chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal AI processing error";
    res.status(500).json({ error: errorMessage });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ToolNest Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
