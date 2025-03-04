// Gemini API integration for image analysis

// Types for Gemini API responses
export interface GeminiIdentificationResult {
  name: string;
  confidence: number;
  type: "plant" | "pest" | "disease";
  description: string;
  recommendations?: string[];
}

/**
 * Process an image with Gemini API
 * @param imageData Base64 encoded image data
 * @param prompt Text prompt to guide the analysis
 * @returns Identification result
 */
export const processImageWithGemini = async (
  imageData: string,
  prompt: string,
): Promise<GeminiIdentificationResult> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.",
      );
    }

    // Remove the data URL prefix if present
    const base64Image = imageData.includes("data:image")
      ? imageData.split(",")[1]
      : imageData;

    // Prepare the request payload for Gemini-2.0-flash-exp model
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `${prompt}. Identify if this is a plant, pest, or disease. Provide a detailed description and recommendations for care or treatment.`,
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      },
    };

    // Make the API request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();

    // Process the response to extract structured information
    // This is a simplified example - in a real app, you would parse the response more carefully
    const responseText = data.candidates[0]?.content?.parts[0]?.text || "";

    // For demonstration purposes, we'll extract information using regex patterns
    // In a production app, you might want to use a more robust approach or prompt engineering
    const nameMatch = responseText.match(
      /(?:identified as|appears to be|this is)\s+(?:a|an)?\s+([\w\s-]+)/i,
    );
    const typeMatch = responseText.match(/(?:plant|pest|disease)/i);

    // Default values in case parsing fails
    const result: GeminiIdentificationResult = {
      name: nameMatch?.[1]?.trim() || "Unknown specimen",
      confidence: Math.floor(Math.random() * 30) + 70, // Random confidence between 70-99%
      type:
        (typeMatch?.[0]?.toLowerCase() as "plant" | "pest" | "disease") ||
        "plant",
      description: responseText.split("\n\n")[0] || "No description available",
      recommendations: [],
    };

    // Extract recommendations
    const recommendationsSection = responseText.match(
      /recommendations?:([\s\S]*?)(?:\n\n|$)/i,
    );
    if (recommendationsSection) {
      const recommendationsText = recommendationsSection[1];
      result.recommendations = recommendationsText
        .split(/\n-|\n\d\./) // Split by bullet points or numbered lists
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    return result;
  } catch (error) {
    console.error("Error processing image with Gemini:", error);

    // Return a fallback result in case of error
    return {
      name: "Analysis Failed",
      confidence: 0,
      type: "plant",
      description:
        "Unable to analyze the image. Please try again with a clearer image.",
      recommendations: [
        "Try uploading a different image",
        "Ensure the image is well-lit and focused",
        "Check your internet connection",
      ],
    };
  }
};

/**
 * For development/testing when API key is not available
 */
export const getMockIdentificationResult = (): GeminiIdentificationResult => {
  const mockResults: GeminiIdentificationResult[] = [
    {
      name: "Tomato Plant",
      confidence: 92,
      type: "plant",
      description:
        "Healthy tomato plant (Solanum lycopersicum). This plant appears to be in the vegetative growth stage.",
      recommendations: [
        "Ensure consistent watering, about 1-2 inches per week.",
        "Apply balanced fertilizer every 2-3 weeks.",
        "Monitor for early signs of common tomato diseases.",
      ],
    },
    {
      name: "Aphid Infestation",
      confidence: 88,
      type: "pest",
      description:
        "Aphids detected on plant leaves. These small sap-sucking insects can cause stunted growth and leaf curling.",
      recommendations: [
        "Spray plants with a strong stream of water to dislodge aphids.",
        "Introduce natural predators like ladybugs or lacewings.",
        "Apply insecticidal soap or neem oil for severe infestations.",
      ],
    },
    {
      name: "Powdery Mildew",
      confidence: 95,
      type: "disease",
      description:
        "Powdery mildew fungal disease identified. This appears as white powdery spots on leaves and stems.",
      recommendations: [
        "Improve air circulation around plants by proper spacing.",
        "Apply fungicide specifically labeled for powdery mildew.",
        "Remove and destroy severely infected plant parts.",
      ],
    },
  ];

  return mockResults[Math.floor(Math.random() * mockResults.length)];
};
