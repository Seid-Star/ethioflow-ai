import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractReceiptData(imageBuffer, mimeType) {
  const systemPrompt = `You read photos of purchase receipts for an Ethiopian shop owner and extract structured data.
Return ONLY valid JSON, no markdown fences, no explanation, in exactly this shape:
{
  "supplierName": "string or null if unreadable",
  "date": "YYYY-MM-DD or null if unreadable",
  "items": [{ "name": "string", "quantity": number, "unitPrice": number }],
  "vat": number (0 if not shown),
  "total": number
}
Rules:
- If a field is genuinely unreadable in the photo, use null rather than guessing a plausible-looking value.
- Quantities and prices must be numbers, not strings.
- Do not invent items that aren't visible in the photo.`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType,
    },
  };

  const maxAttempts = 3;
  let response;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      response = await genAI.models.generateContent({
        model: "gemini-flash-latest",
        contents: [imagePart, { text: "Extract the receipt data as JSON." }],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.1,
        },
      });
      break; // success, stop retrying
    } catch (err) {
      const isOverloaded = err?.status === 503;
      const isLastAttempt = attempt === maxAttempts;

      if (isOverloaded && !isLastAttempt) {
        console.warn(
          `⚠ Gemini overloaded during OCR (attempt ${attempt}/${maxAttempts}), retrying...`,
        );
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        continue;
      }

      if (isOverloaded) {
        throw new Error(
          "The AI service is a bit busy right now. Please try scanning again in a moment.",
        );
      }
      throw err;
    }
  }

  const rawText = response.text.trim();
  const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      "Could not read this receipt clearly. Try a clearer photo with good lighting.",
    );
  }
}
