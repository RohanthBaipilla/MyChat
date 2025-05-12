import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.REACT_APP_API_KEY;

if (!apiKey) {
  throw new Error("API key is missing. Make sure it is set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Converts File object to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result.split(',')[1]; // Remove data URL prefix
      resolve({
        inlineData: {
          data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function generateContent(prompt, imageFiles = []) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));
    
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}
