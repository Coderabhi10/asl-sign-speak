import { createServerFn } from "@tanstack/react-start";

export const interpretSign = createServerFn({ method: "POST" })
  .inputValidator((input: { imageBase64: string }) => {
    if (!input?.imageBase64 || typeof input.imageBase64 !== "string") {
      throw new Error("imageBase64 is required");
    }
    if (input.imageBase64.length > 6_000_000) {
      throw new Error("Image too large");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { interpretation: null, error: "AI service not configured" };
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You are an expert sign language interpreter (familiar with both ASL and ISL). " +
                "Look at the hand in the image and identify the sign being made. " +
                "Reply with ONLY the letter, word, or short phrase being signed. " +
                "If unclear, reply with your best single guess. " +
                "Do not add explanations, punctuation, or quotes. Maximum 6 words.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: "What ASL sign is this?" },
                {
                  type: "image_url",
                  image_url: { url: data.imageBase64 },
                },
              ],
            },
          ],
        }),
      });

      if (res.status === 429) {
        return { interpretation: null, error: "Rate limit hit, please slow down." };
      }
      if (res.status === 402) {
        return {
          interpretation: null,
          error: "AI credits exhausted. Add credits in Workspace → Usage.",
        };
      }
      if (!res.ok) {
        const t = await res.text();
        console.error("AI gateway error:", res.status, t);
        return { interpretation: null, error: "AI service error" };
      }

      const json: any = await res.json();
      const text: string =
        json.choices?.[0]?.message?.content?.trim() ?? "";
      return { interpretation: text || null, error: null };
    } catch (err) {
      console.error("interpretSign failed:", err);
      return { interpretation: null, error: "Request failed" };
    }
  });
