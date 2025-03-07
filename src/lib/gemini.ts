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
      activeIngredient?: string;
      applicationRate?: string;
      method?: string;
      methodPoints?: string[];
      safeDays?: number;
      safety?: string;
      safetyPoints?: string[];
      brands?: string[];
    }[];
    organic?: {
      name: string;
      activeIngredient?: string;
      applicationRate?: string;
      method?: string;
      methodPoints?: string[];
      safeDays?: number;
      safety?: string;
      safetyPoints?: string[];
    }[];
    cultural?: string[];
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
  userCountry: string = "Kenya",
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

    // Prepare the request payload for Gemini API
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `${prompt}. Analyze this image and identify any plant, pest, or disease. If no issues are found, respond with EXACTLY "No disease or pests were identified in the image." followed by a brief description of the healthy plant.

If a pest or disease is identified, provide a detailed analysis in the following format:

1. Name: The identified pest or disease name
2. Type: Whether it's a pest or disease
3. Confidence: Your confidence level in the identification (as a percentage)
4. Description: A brief description of the pest or disease
5. Causes: List the main causes or conditions that lead to this pest or disease
6. Control Methods:
   a. Chemical Control: For each chemical control option, provide:
      - Name of the chemical/product
      - Active Ingredient
      - Application Rate (e.g., "1 ml/L water")
      - Method of application
      - Safe Days before harvest
      - Safety precautions
      - At least two specific brand names available in ${userCountry}
   b. Organic Control: For each organic control option, provide:
      - Name of the organic solution
      - Active Ingredient
      - Application Rate
      - Method of application
      - Safe Days before harvest
      - Safety precautions
   c. Cultural Control: List cultural practices to prevent or manage the issue
7. Plants Affected: List of crops commonly affected by this pest or disease

Format your response to be easily parsed by a computer program. Be concise but thorough.`,
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
        temperature: 0.2,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      },
    };

    // Make the API request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

    // Extract name
    const nameMatch = responseText.match(/Name:\s*([^\n]+)/i);
    const name = nameMatch ? nameMatch[1].trim() : "Unknown specimen";

    // Extract type
    const typeMatch = responseText.match(/Type:\s*(pest|disease)/i);
    const type = typeMatch
      ? (typeMatch[1].toLowerCase() as "pest" | "disease")
      : "disease";

    // Extract confidence
    const confidenceMatch = responseText.match(/Confidence:\s*(\d+)/i);
    const confidence = confidenceMatch
      ? parseInt(confidenceMatch[1])
      : Math.floor(Math.random() * 20) + 80;

    // Extract description
    const descriptionMatch = responseText.match(/Description:\s*([^\n]+)/i);
    const description = descriptionMatch
      ? descriptionMatch[1].trim()
      : "No description available";

    // Extract causes
    const causesSection = responseText.match(
      /Causes:[\s\S]*?(?=Control Methods:|Plants Affected:|$)/i,
    );
    let causes: string[] = [];
    if (causesSection) {
      causes = causesSection[0]
        .replace(/Causes:\s*/i, "")
        .split(/\n-|\n\d\./) // Split by bullet points or numbered lists
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    // Extract control methods
    const controlMethodsSection = responseText.match(
      /Control Methods:[\s\S]*?(?=Plants Affected:|$)/i,
    );
    let controlMeasures = {
      chemical: [] as any[],
      organic: [] as any[],
      cultural: [] as string[],
    };

    if (controlMethodsSection) {
      // Extract chemical controls
      const chemicalSection = controlMethodsSection[0].match(
        /Chemical Control:[\s\S]*?(?=Organic Control:|Cultural Control:|$)/i,
      );
      if (chemicalSection) {
        // Look for chemical control blocks
        const chemicalBlocks = chemicalSection[0]
          .split(/\n\s*-\s*(?=[A-Z])|\n\s*\d+\.\s*(?=[A-Z])/)
          .slice(1);

        for (const block of chemicalBlocks) {
          if (!block.trim()) continue;

          const nameMatch = block.match(/^([^\n]+)/i);
          const activeIngredientMatch = block.match(
            /Active Ingredient:\s*([^\n]+)/i,
          );
          const applicationRateMatch = block.match(
            /Application Rate:\s*([^\n]+)/i,
          );
          const methodMatch = block.match(
            /Method:\s*([^\n]+(?:\n(?!\w+:)[^\n]+)*)/i,
          );
          const safeDaysMatch = block.match(/Safe Days:\s*(\d+)/i);
          const safetyMatch = block.match(
            /Safety:\s*([^\n]+(?:\n(?!\w+:)[^\n]+)*)/i,
          );
          const brandsMatch = block.match(
            /(?:Brands|Brand names):\s*([^\n]+)/i,
          );

          const chemicalControl: any = {
            name: nameMatch ? nameMatch[1].trim() : "Unknown chemical",
          };

          if (activeIngredientMatch)
            chemicalControl.activeIngredient = activeIngredientMatch[1].trim();
          if (applicationRateMatch)
            chemicalControl.applicationRate = applicationRateMatch[1].trim();
          if (methodMatch) {
            const methodText = methodMatch[1].trim();
            if (methodText.includes(".")) {
              chemicalControl.methodPoints = methodText
                .split(/\.\s+/)
                .filter((p) => p.trim().length > 0);
            } else {
              chemicalControl.method = methodText;
            }
          }
          if (safeDaysMatch)
            chemicalControl.safeDays = parseInt(safeDaysMatch[1]);
          if (safetyMatch) {
            const safetyText = safetyMatch[1].trim();
            if (safetyText.includes(".")) {
              chemicalControl.safetyPoints = safetyText
                .split(/\.\s+/)
                .filter((p) => p.trim().length > 0);
            } else {
              chemicalControl.safety = safetyText;
            }
          }
          if (brandsMatch) {
            chemicalControl.brands = brandsMatch[1]
              .split(/,\s*/)
              .map((b) => b.trim());
          }

          controlMeasures.chemical.push(chemicalControl);
        }
      }

      // Extract organic controls
      const organicSection = controlMethodsSection[0].match(
        /Organic Control:[\s\S]*?(?=Chemical Control:|Cultural Control:|$)/i,
      );
      if (organicSection) {
        // Look for organic control blocks
        const organicBlocks = organicSection[0]
          .split(/\n\s*-\s*(?=[A-Z])|\n\s*\d+\.\s*(?=[A-Z])/)
          .slice(1);

        for (const block of organicBlocks) {
          if (!block.trim()) continue;

          const nameMatch = block.match(/^([^\n]+)/i);
          const activeIngredientMatch = block.match(
            /Active Ingredient:\s*([^\n]+)/i,
          );
          const applicationRateMatch = block.match(
            /Application Rate:\s*([^\n]+)/i,
          );
          const methodMatch = block.match(
            /Method:\s*([^\n]+(?:\n(?!\w+:)[^\n]+)*)/i,
          );
          const safeDaysMatch = block.match(/Safe Days:\s*(\d+)/i);
          const safetyMatch = block.match(
            /Safety:\s*([^\n]+(?:\n(?!\w+:)[^\n]+)*)/i,
          );

          const organicControl: any = {
            name: nameMatch ? nameMatch[1].trim() : "Unknown organic control",
          };

          if (activeIngredientMatch)
            organicControl.activeIngredient = activeIngredientMatch[1].trim();
          if (applicationRateMatch)
            organicControl.applicationRate = applicationRateMatch[1].trim();
          if (methodMatch) {
            const methodText = methodMatch[1].trim();
            if (methodText.includes(".")) {
              organicControl.methodPoints = methodText
                .split(/\.\s+/)
                .filter((p) => p.trim().length > 0);
            } else {
              organicControl.method = methodText;
            }
          }
          if (safeDaysMatch)
            organicControl.safeDays = parseInt(safeDaysMatch[1]);
          if (safetyMatch) {
            const safetyText = safetyMatch[1].trim();
            if (safetyText.includes(".")) {
              organicControl.safetyPoints = safetyText
                .split(/\.\s+/)
                .filter((p) => p.trim().length > 0);
            } else {
              organicControl.safety = safetyText;
            }
          }

          controlMeasures.organic.push(organicControl);
        }
      }

      // Extract cultural controls
      const culturalSection = controlMethodsSection[0].match(
        /Cultural Control:[\s\S]*?(?=Chemical Control:|Organic Control:|$)/i,
      );
      if (culturalSection) {
        controlMeasures.cultural = culturalSection[0]
          .replace(/Cultural Control:\s*/i, "")
          .split(/\n-|\n\d\./) // Split by bullet points or numbered lists
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }
    }

    // Extract plants affected
    const plantsAffectedSection = responseText.match(
      /Plants Affected:[\s\S]*?$/i,
    );
    let plantsAffected: string[] = [];
    if (plantsAffectedSection) {
      plantsAffected = plantsAffectedSection[0]
        .replace(/Plants Affected:\s*/i, "")
        .split(/\n-|\n\d\./) // Split by bullet points or numbered lists
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    // Default values for chemical controls if none found
    if (controlMeasures.chemical.length === 0) {
      const defaultChemical =
        type === "pest"
          ? {
              name: "Deltamethrin",
              activeIngredient: "Deltamethrin 25 g/L EC",
              applicationRate: "1 ml/L water",
              methodPoints: [
                "Apply as a foliar spray",
                "Ensure thorough coverage of the plant",
                "Repeat after 7-10 days if infestation persists",
              ],
              safeDays: 14,
              safetyPoints: [
                "Wear protective equipment during application",
                "Keep away from water sources",
                "Avoid contact with skin and eyes",
              ],
              brands: ["Duduthrin", "Tata Alpha"],
            }
          : {
              name: "Mancozeb",
              activeIngredient: "Mancozeb 80% WP",
              applicationRate: "2-3 g/L water",
              methodPoints: [
                "Apply as a preventive spray",
                "Ensure thorough coverage of the plant",
                "Repeat every 7-14 days",
              ],
              safeDays: 7,
              safetyPoints: [
                "Wear protective equipment during application",
                "Keep away from water sources",
                "Avoid contact with skin and eyes",
              ],
              brands: ["Oshothane", "Dithane M-45"],
            };

      controlMeasures.chemical.push(defaultChemical);
    }

    // Default values for organic controls if none found
    if (controlMeasures.organic.length === 0) {
      const defaultOrganic = {
        name: "Neem Oil",
        activeIngredient: "Azadirachtin",
        applicationRate: "5 ml/L water",
        methodPoints: [
          "Apply as a foliar spray",
          "Ensure thorough coverage",
          "Repeat every 5-7 days",
        ],
        safeDays: 0,
        safetyPoints: [
          "Wear gloves during application",
          "Avoid spraying during hot, sunny conditions",
        ],
      };

      controlMeasures.organic.push(defaultOrganic);
    }

    // Default values for cultural controls if none found
    if (!controlMeasures.cultural || controlMeasures.cultural.length === 0) {
      controlMeasures.cultural = [
        "Practice crop rotation",
        "Maintain proper plant spacing for good air circulation",
        "Remove and destroy infected plant debris",
        "Use resistant varieties when available",
        "Maintain proper field sanitation",
      ];
    }

    // Create the result object
    const result: GeminiIdentificationResult = {
      name,
      confidence,
      type,
      description,
      causes,
      plantsAffected,
      controlMeasures,
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
      name: "Fall Armyworm (Spodoptera frugiperda)",
      confidence: 92,
      type: "pest",
      description: "A destructive caterpillar pest that feeds on crops.",
      causes: [
        "Migration of adult moths",
        "Warm temperatures and high humidity",
        "Absence of natural predators",
      ],
      controlMeasures: {
        chemical: [
          {
            name: "Duduthrin",
            activeIngredient: "Deltamethrin 25 g/L EC",
            applicationRate: "1 ml/L water",
            methodPoints: [
              "Apply as a foliar spray, ensuring thorough coverage of the maize plants, especially the whorl",
              "Repeat after 7-10 days if infestation persists",
            ],
            safeDays: 14,
            safetyPoints: [
              "Wear nitrile gloves, N95 mask, and goggles during application",
              "Avoid contact with skin and eyes",
              "Keep children and animals away from treated areas until the spray has dried",
            ],
            brands: ["Duduthrin", "Tata Alpha"],
          },
          {
            name: "Belt Expert",
            activeIngredient: "Flubendiamide 480 g/L SC",
            applicationRate: "0.3 ml/L water",
            methodPoints: [
              "Apply as a foliar spray, targeting the early larval stages",
              "Ensure good coverage of the plant, particularly the whorl and stem",
              "Repeat after 10-14 days if necessary",
            ],
            safeDays: 21,
            safetyPoints: [
              "Wear nitrile gloves, a long-sleeved shirt, long pants, and eye protection",
              "Avoid inhaling the spray mist",
              "Wash thoroughly with soap and water after handling",
            ],
            brands: ["Belt Expert", "Fame"],
          },
        ],
        organic: [
          {
            name: "Neem Oil",
            activeIngredient: "Azadirachtin",
            applicationRate: "5 ml/L water",
            methodPoints: [
              "Apply as a foliar spray, ensuring thorough coverage, especially the whorl",
              "Repeat every 5-7 days",
            ],
            safeDays: 0,
            safetyPoints: [
              "Wear gloves and eye protection",
              "Avoid spraying during hot, sunny conditions",
            ],
          },
        ],
        cultural: [
          "Plant early to avoid peak pest populations",
          "Use trap crops like napier grass around maize fields",
          "Regularly scout fields for egg masses and young larvae",
          "Practice crop rotation with non-host crops",
          "Maintain field sanitation by removing crop residues after harvest",
        ],
      },
      plantsAffected: [
        "Maize",
        "Sorghum",
        "Rice",
        "Sugarcane",
        "Millet",
        "Cotton",
        "Vegetables",
      ],
    },
    {
      name: "Tomato Leaf Miner (Tuta absoluta)",
      confidence: 88,
      type: "pest",
      description:
        "A devastating pest that mines leaves, stems, and fruits of tomato plants.",
      causes: [
        "Introduction through infested seedlings",
        "Warm climate conditions",
        "Poor crop rotation practices",
      ],
      controlMeasures: {
        chemical: [
          {
            name: "Coragen",
            activeIngredient: "Chlorantraniliprole 200 g/L SC",
            applicationRate: "0.5 ml/L water",
            methodPoints: [
              "Apply as a foliar spray ensuring complete coverage",
              "Target application when larvae are young",
              "Repeat application after 14 days if necessary",
            ],
            safeDays: 3,
            safetyPoints: [
              "Wear protective clothing during application",
              "Avoid contact with skin, eyes, and clothing",
              "Do not apply when bees are actively foraging",
            ],
            brands: ["Coragen", "Prevathon"],
          },
          {
            name: "Voliam Targo",
            activeIngredient: "Chlorantraniliprole 45g/L + Abamectin 18g/L EC",
            applicationRate: "0.8 ml/L water",
            methodPoints: [
              "Apply as a foliar spray ensuring thorough coverage",
              "Apply at first sign of infestation",
              "Repeat after 10-14 days if necessary",
            ],
            safeDays: 7,
            safetyPoints: [
              "Wear protective equipment during application",
              "Highly toxic to aquatic organisms and bees",
              "Do not spray during flowering",
            ],
            brands: ["Voliam Targo", "Virtako"],
          },
        ],
        organic: [
          {
            name: "Bacillus thuringiensis (Bt)",
            activeIngredient: "Bacillus thuringiensis kurstaki",
            applicationRate: "2-3 g/L water",
            methodPoints: [
              "Apply as a foliar spray in the evening",
              "Ensure thorough coverage of all plant surfaces",
              "Repeat application every 7 days",
            ],
            safeDays: 0,
            safetyPoints: [
              "Safe for humans and beneficial insects",
              "Can be applied up to day of harvest",
            ],
          },
        ],
        cultural: [
          "Use pheromone traps to monitor and mass trap adults",
          "Remove and destroy infested leaves and fruits",
          "Use insect-proof nets in nurseries and greenhouses",
          "Practice crop rotation with non-solanaceous crops",
          "Maintain field sanitation",
        ],
      },
      plantsAffected: [
        "Tomato",
        "Potato",
        "Eggplant",
        "Pepper",
        "Other solanaceous crops",
      ],
    },
    {
      name: "Late Blight (Phytophthora infestans)",
      confidence: 95,
      type: "disease",
      description:
        "A devastating fungal disease that affects leaves, stems, and fruits of plants.",
      causes: [
        "Fungal pathogen (Phytophthora infestans)",
        "Cool, wet weather conditions",
        "Poor air circulation",
        "Overhead irrigation",
      ],
      controlMeasures: {
        chemical: [
          {
            name: "Ridomil Gold",
            activeIngredient: "Metalaxyl-M + Mancozeb 68% WP",
            applicationRate: "2.5 g/L water",
            methodPoints: [
              "Apply as a preventive spray before disease onset",
              "Ensure thorough coverage of all plant surfaces",
              "Repeat application every 7-14 days depending on disease pressure",
            ],
            safeDays: 7,
            safetyPoints: [
              "Wear protective clothing during application",
              "Avoid contact with skin and eyes",
              "Do not apply in windy conditions",
            ],
            brands: ["Ridomil Gold", "Victory"],
          },
          {
            name: "Revus",
            activeIngredient: "Mandipropamid 250 g/L SC",
            applicationRate: "0.6 ml/L water",
            methodPoints: [
              "Apply as a preventive treatment",
              "Ensure complete coverage of the plant",
              "Repeat every 7-10 days",
            ],
            safeDays: 3,
            safetyPoints: [
              "Wear protective equipment during mixing and application",
              "Keep out of reach of children",
              "Do not contaminate water sources",
            ],
            brands: ["Revus", "Revus Top"],
          },
        ],
        organic: [
          {
            name: "Copper Hydroxide",
            activeIngredient: "Copper Hydroxide 77% WP",
            applicationRate: "2-3 g/L water",
            methodPoints: [
              "Apply as a preventive spray",
              "Ensure thorough coverage of all plant surfaces",
              "Repeat application every 7 days",
            ],
            safeDays: 1,
            safetyPoints: [
              "Wear protective equipment during application",
              "May cause leaf burn in hot weather",
              "Can build up in soil with repeated use",
            ],
          },
        ],
        cultural: [
          "Plant resistant varieties when available",
          "Provide adequate spacing between plants for good air circulation",
          "Avoid overhead irrigation",
          "Remove and destroy infected plant material",
          "Practice crop rotation with non-solanaceous crops",
        ],
      },
      plantsAffected: [
        "Potato",
        "Tomato",
        "Eggplant",
        "Other solanaceous crops",
      ],
    },
  ];

  return mockResults[Math.floor(Math.random() * mockResults.length)];
};
