import { InferenceClient } from "@huggingface/inference";

const hf = new InferenceClient(process.env.HF_TOKEN);

const response = await hf.chatCompletion({
  provider: "hf-inference",
  model: "Qwen/Qwen2.5-7B-Instruct",
  messages: [
    { role: "user", content: "Explícame qué es una API en 3 líneas." }
  ],
  max_tokens: 200,
  temperature: 0.7
});

console.log(response.choices[0].message.content);