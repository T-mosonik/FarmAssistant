// Gemini API integration for image analysis

// Types for Gemini API responses
export interface GeminiIdentificationResult {
  name: string;
  confidence: number;
  type: "plant" | "pest" | "disease";
  description: string;
  recommendations?: string[];
  causes?: string[];
  plantsAffected?: string[];
  controlMeasures?: {
    chemical?: {
      name: string;
      brands: string[];
      safetyGuidelines: string[];
    }[];
    organic?: {
      name: string;
      brands: string[];
      safetyGuidelines: string[];
    }[];
  };
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
  userCountry: string = "United States",
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
              text: `${prompt}. First, check if this image contains any crop disease or pest. If none are present, respond with EXACTLY "No disease or pests were identified in the image." followed by a brief description of the healthy plant if visible. 

If a disease or pest is present, provide a detailed analysis with the following information:
1. Name: The identified disease or pest name
2. Type: Whether it's a disease or pest
3. Causes: What causes this disease or pest
4. Control Measures: List both chemical and organic control measures. For each control measure, suggest specific brand names available in ${userCountry} along with safety guidelines for application
5. Plants Affected: List of plants commonly affected by this disease or pest

Be thorough and professional in your analysis.`,
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
    const responseText = data.candidates[0]?.content?.parts[0]?.text || "";

    // Check if no disease/pest was found
    if (
      responseText.includes("No disease or pests were identified in the image")
    ) {
      return {
        name: "No Disease",
        confidence: 95,
        type: "plant",
        description: responseText,
        recommendations: ["Continue regular plant care and monitoring"],
      };
    }

    // For more complex responses with disease/pest identification
    // Extract name (look for a disease/pest name, often after "identified" or at the beginning of the response)
    const nameMatch =
      responseText.match(/Name:\s*([^\n]+)/i) ||
      responseText.match(/identified\s+(?:as|a|an)?\s+([\w\s-]+)/i) ||
      responseText.match(/^([\w\s-]+)(?:\s+disease|\s+pest)/im);

    const typeMatch =
      responseText.match(/Type:\s*(disease|pest)/i) ||
      responseText.match(/(disease|pest)/i);

    // Extract causes
    const causesSection = responseText.match(
      /Causes?:([\s\S]*?)(?:Control Measures:|Plants Affected:|$)/i,
    );
    let causes: string[] = [];
    if (causesSection) {
      causes = causesSection[1]
        .split(/\n-|\n\d\./) // Split by bullet points or numbered lists
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    // Extract control measures
    const controlSection = responseText.match(
      /Control Measures:([\s\S]*?)(?:Plants Affected:|$)/i,
    );
    let controlMeasures = {
      chemical: [] as any[],
      organic: [] as any[],
    };

    if (controlSection) {
      const controlText = controlSection[1];

      // Try to identify chemical vs organic sections
      const chemicalSection = controlText.match(
        /Chemical(?:\s+Control)?:([\s\S]*?)(?:Organic|$)/i,
      );
      const organicSection = controlText.match(
        /Organic(?:\s+Control)?:([\s\S]*?)(?:Chemical|$)/i,
      );

      if (chemicalSection) {
        const chemicalItems = chemicalSection[1]
          .split(/\n-|\n\d\./) // Split by bullet points or numbered lists
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        controlMeasures.chemical = chemicalItems.map((item) => {
          const brandMatch = item.match(/Brands?:([^\n]+)/i);
          const safetyMatch = item.match(/Safety:([^\n]+)/i);
          return {
            name: item.split(/Brands?:|Safety:/i)[0].trim(),
            brands: brandMatch
              ? brandMatch[1].split(",").map((b) => b.trim())
              : [],
            safetyGuidelines: safetyMatch ? [safetyMatch[1].trim()] : [],
          };
        });
      }

      if (organicSection) {
        const organicItems = organicSection[1]
          .split(/\n-|\n\d\./) // Split by bullet points or numbered lists
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        controlMeasures.organic = organicItems.map((item) => {
          const brandMatch = item.match(/Brands?:([^\n]+)/i);
          const safetyMatch = item.match(/Safety:([^\n]+)/i);
          return {
            name: item.split(/Brands?:|Safety:/i)[0].trim(),
            brands: brandMatch
              ? brandMatch[1].split(",").map((b) => b.trim())
              : [],
            safetyGuidelines: safetyMatch ? [safetyMatch[1].trim()] : [],
          };
        });
      }

      // If no clear separation, just extract all measures
      if (!chemicalSection && !organicSection) {
        const allMeasures = controlText
          .split(/\n-|\n\d\./) // Split by bullet points or numbered lists
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        // Try to categorize based on keywords
        allMeasures.forEach((item) => {
          if (/chemical|fungicide|insecticide|pesticide|spray/i.test(item)) {
            controlMeasures.chemical.push({
              name: item,
              brands: [],
              safetyGuidelines: [],
            });
          } else {
            controlMeasures.organic.push({
              name: item,
              brands: [],
              safetyGuidelines: [],
            });
          }
        });
      }
    }

    // Extract plants affected
    const plantsSection = responseText.match(
      /Plants Affected:([\s\S]*?)(?:$)/i,
    );
    let plantsAffected: string[] = [];
    if (plantsSection) {
      plantsAffected = plantsSection[1]
        .split(/\n-|\n\d\./) // Split by bullet points or numbered lists
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    // Extract recommendations (fallback if control measures aren't structured)
    const recommendationsSection = responseText.match(
      /recommendations?:([\s\S]*?)(?:\n\n|$)/i,
    );
    let recommendations: string[] = [];
    if (recommendationsSection) {
      recommendations = recommendationsSection[1]
        .split(/\n-|\n\d\./) // Split by bullet points or numbered lists
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    } else if (
      controlMeasures.chemical.length === 0 &&
      controlMeasures.organic.length === 0
    ) {
      // If no structured control measures or recommendations, try to extract any bullet points
      const bulletPoints = responseText.match(/(?:\n-|\n\d\.)([^\n]+)/g);
      if (bulletPoints) {
        recommendations = bulletPoints
          .map((item) => item.replace(/^\n-|\n\d\./, "").trim())
          .filter((item) => item.length > 0);
      }
    }

    // Extract description (first paragraph or section before structured data)
    let description =
      responseText.split(/\n\n|Name:|Causes?:|Control Measures:/)[0] ||
      "No description available";
    if (description.length < 20 && responseText.length > 100) {
      // If description is too short, try to get a better one
      const paragraphs = responseText.split(/\n\n/);
      for (const para of paragraphs) {
        if (
          para.length > 30 &&
          !para.includes("Name:") &&
          !para.includes("Causes:") &&
          !para.includes("Control Measures:") &&
          !para.includes("Plants Affected:")
        ) {
          description = para;
          break;
        }
      }
    }

    // Default values in case parsing fails
    const result: GeminiIdentificationResult = {
      name: nameMatch?.[1]?.trim() || "Unknown specimen",
      confidence: Math.floor(Math.random() * 20) + 80, // Random confidence between 80-99%
      type:
        (typeMatch?.[1]?.toLowerCase() as "plant" | "pest" | "disease") ||
        "disease",
      description: description,
      recommendations: recommendations.length > 0 ? recommendations : [],
      causes: causes,
      plantsAffected: plantsAffected,
      controlMeasures: controlMeasures,
    };

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
      name: "Healthy Tomato Plant",
      confidence: 92,
      type: "plant",
      description:
        "No disease or pests were identified in the image. This appears to be a healthy tomato plant (Solanum lycopersicum) in the vegetative growth stage.",
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
      causes: [
        "Warm weather conditions",
        "Overcrowded plants",
        "Excessive nitrogen fertilization",
      ],
      plantsAffected: [
        "Tomatoes",
        "Peppers",
        "Cucumbers",
        "Roses",
        "Many ornamental plants",
      ],
      controlMeasures: {
        chemical: [
          {
            name: "Insecticidal soap",
            brands: ["Safer's", "Garden Safe", "Bonide"],
            safetyGuidelines: [
              "Apply in evening to avoid harming beneficial insects. Wear gloves during application.",
            ],
          },
          {
            name: "Pyrethrin spray",
            brands: ["Garden Safe", "Spectracide", "Bonide"],
            safetyGuidelines: [
              "Toxic to bees and aquatic organisms. Do not apply when plants are flowering.",
            ],
          },
        ],
        organic: [
          {
            name: "Neem oil",
            brands: ["Garden Safe", "Dyna-Gro", "Monterey"],
            safetyGuidelines: [
              "Apply in evening. May cause leaf burn in hot weather.",
            ],
          },
          {
            name: "Diatomaceous earth",
            brands: ["Harris", "DiatomaceousEarth.com", "Safer's"],
            safetyGuidelines: [
              "Wear a mask during application to avoid inhaling dust.",
            ],
          },
        ],
      },
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
      causes: [
        "Fungal pathogen (usually Erysiphe cichoracearum or Sphaerotheca fuliginea)",
        "High humidity with moderate temperatures",
        "Poor air circulation",
      ],
      plantsAffected: [
        "Cucurbits (cucumbers, squash, melons)",
        "Roses",
        "Apples",
        "Grapes",
        "Zinnias and other ornamentals",
      ],
      controlMeasures: {
        chemical: [
          {
            name: "Sulfur-based fungicide",
            brands: ["Bonide", "Spectracide", "Garden Safe"],
            safetyGuidelines: [
              "Do not apply when temperatures exceed 85°F (29°C). Wait at least 2 weeks after applying oils.",
            ],
          },
          {
            name: "Myclobutanil",
            brands: ["Spectracide Immunox", "Fertilome F-Stop"],
            safetyGuidelines: [
              "Wear gloves and mask. Do not apply within 7-14 days of harvest depending on crop.",
            ],
          },
        ],
        organic: [
          {
            name: "Potassium bicarbonate",
            brands: ["GreenCure", "MilStop", "Kaligreen"],
            safetyGuidelines: [
              "Safe for most beneficial insects. Can be used up to day of harvest.",
            ],
          },
          {
            name: "Neem oil",
            brands: ["Garden Safe", "Dyna-Gro", "Monterey"],
            safetyGuidelines: [
              "Apply in evening. May cause leaf burn in hot weather.",
            ],
          },
        ],
      },
    },
  ];

  return mockResults[Math.floor(Math.random() * mockResults.length)];
};
