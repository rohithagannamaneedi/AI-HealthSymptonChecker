import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const urgency = "high";       // example: could be "low", "medium", "high"
const userContext = "adult";  // example: "child", "senior", etc.


// System prompt with RTFC framework (Zero-Shot)
const systemPrompt = `
You are a trusted medical assistant.

ROLE: Provide safe, factual, and structured health suggestions based on user symptoms. 
Do not give a final diagnosis, but always include advice on when to see a doctor.

TASK: Take the user's reported symptoms and return structured medical guidance.

FORMAT: Respond strictly in JSON with the following keys:
{
  "Possible Conditions": [],
  "Suggested Precautions": [],
  "Severity Level": "",
  "When to See a Doctor": "",
  "Info Sources": []
}

CONSTRAINTS: Keep responses short, safe, and actionable. Ground answers in reliable medical sources like WHO, CDC, or Mayo Clinic.

ZERO-SHOT PROMPT: Without seeing any examples, generate the health guidance purely based on the user's input.

ONE-SHOT PROMPT: Here is an example of how you should respond:

USER: "I have a headache and mild fever for 1 day"
ASSISTANT:
{
  "Possible Conditions": ["Common cold", "Mild viral infection"],
  "Suggested Precautions": ["Drink warm fluids", "Rest well", "Monitor temperature"],
  "Severity Level": "Mild",
  "When to See a Doctor": "If fever lasts more than 3 days or headache worsens",
  "Info Sources": ["WHO", "CDC"]
}

 MULTI-SHOT PROMPTING (More Examples):
USER: "I feel chest pain and shortness of breath"
ASSISTANT:
{
  "Possible Conditions": ["Angina", "Asthma attack", "Heart-related issue"],
  "Suggested Precautions": ["Stop physical activity", "Sit upright", "Monitor symptoms"],
  "Severity Level": "Severe",
  "When to See a Doctor": "Immediately or call emergency services",
  "Info Sources": ["Mayo Clinic", "CDC"]
}

USER: "I have a sore throat and runny nose"
ASSISTANT:
{
  "Possible Conditions": ["Common cold", "Seasonal allergies"],
  "Suggested Precautions": ["Gargle warm salt water", "Stay hydrated", "Rest"],
  "Severity Level": "Mild",
  "When to See a Doctor": "If symptoms last more than 10 days or worsen",
  "Info Sources": ["WHO", "CDC"]
}

DYNAMIC PROMPTING:
The urgency of the situation is: ${urgency}.
The user context is: ${userContext}.
Adjust your tone and suggestions based on this information.

CHAIN-OF-THOUGHT PROMPTING (Reason step by step before final JSON):
1. Identify the main symptoms.
2. Recall common conditions linked to those symptoms.
3. Apply medical safety rules (never give a final diagnosis).
4. Do NOT show the reasoning to the user — only output the final structured JSON.

TOKENS & TOKENIZATION:
After every response, log total tokens used (prompt + completion).

`;


// ...existing code...

export async function checkSymptoms(input, returnResult = false) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input },
      ],
      temperature: 0.3,
      frequency_penalty: 0.5,
    });

    const content = response.choices[0].message.content;
    if (returnResult) {
      try {
        return JSON.parse(content);
      } catch {
        return { error: "Could not parse AI response." };
      }
    } else {
      console.log("🩺 Health Assistant Result:");
      console.log(content);
    }
  } catch (error) {
    if (returnResult) return { error: "Error contacting AI service." };
    console.error("Error:", error);
  }
}

// Remove or comment out the example call at the bottom:
// checkSymptoms("I just got stabbed in the stomach");