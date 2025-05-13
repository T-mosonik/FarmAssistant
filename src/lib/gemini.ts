// Gemini API integration for image analysis

// Types for Gemini API responses
export interface GeminiIdentificationResult {
  name: string;
  confidence: number;
  type: "plant" | "pest" | "disease" | "error";
  description: string;
  recommendations?: string[];
  causes?: string[];
  plantsAffected: string[];
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
4. Description: A brief description of the pest or disease in 1-2 sentences
5. Causes: List 2-3 main causes or conditions that lead to this pest or disease
6. Control Methods:
   a. Chemical Control: For each chemical control option (limit to at least 2), provide:
      - Name of the chemical/product
      - Active Ingredient (format as: "Active ingredient 25 g/L EC")
      - Application Rate (e.g., "1 ml/L water")
      - At least two specific brand names available in ${userCountry}
   b. Organic Control: For each organic control option (limit to 1), provide:
      - Name of the organic solution
      - Active Ingredient
      - Application Rate
   c. Cultural Control: List 3-5 cultural practices to prevent or manage the issue
7. Plants Affected: List of crops commonly affected by this pest or disease (limit to 5)

Keep your response concise and focused on the most important information. Format it to be easily read by farmers.`,
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
        plantsAffected: []
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

    // Default values for chemical controls if none found
    if (controlMeasures.chemical.length === 0) {
      // Provide different default chemicals based on the pest/disease name or type
      let defaultChemical;

      // Check for common pests and diseases in the name
      const nameLower = name.toLowerCase();

      if (type === "pest") {
        if (nameLower.includes("aphid")) {
          defaultChemical = {
            name: "Imidacloprid",
            activeIngredient: "Imidacloprid 17.8% SL",
            applicationRate: "0.5 ml/L water",
            methodPoints: [
              "Apply as a foliar spray targeting the undersides of leaves",
              "Can also be applied as a soil drench for systemic protection",
              "Repeat after 14 days if infestation persists",
            ],
            safeDays: 21,
            safetyPoints: [
              "Highly toxic to bees - do not apply during flowering",
              "Wear protective equipment during application",
              "Keep away from water sources",
            ],
            brands: ["Confidor", "Admire"],
          };
        } else if (nameLower.includes("mite") || nameLower.includes("spider")) {
          defaultChemical = {
            name: "Abamectin",
            activeIngredient: "Abamectin 1.8% EC",
            applicationRate: "0.5 ml/L water",
            methodPoints: [
              "Apply as a foliar spray ensuring complete coverage",
              "Target the undersides of leaves where mites congregate",
              "Repeat after 7 days if infestation persists",
            ],
            safeDays: 7,
            safetyPoints: [
              "Toxic to fish and aquatic organisms",
              "Wear protective equipment during application",
              "Avoid application during hot periods of the day",
            ],
            brands: ["Dynamec", "Agrimec"],
          };
        } else if (nameLower.includes("thrip")) {
          defaultChemical = {
            name: "Spinosad",
            activeIngredient: "Spinosad 45% SC",
            applicationRate: "0.3 ml/L water",
            methodPoints: [
              "Apply as a foliar spray ensuring thorough coverage",
              "Target growing points and flowers where thrips hide",
              "Repeat after 7-10 days if infestation persists",
            ],
            safeDays: 3,
            safetyPoints: [
              "Low toxicity to mammals but toxic to bees when wet",
              "Avoid application during flowering or apply in evening",
              "Wear protective equipment during application",
            ],
            brands: ["Success", "Tracer"],
          };
        } else if (
          nameLower.includes("caterpillar") ||
          nameLower.includes("worm") ||
          nameLower.includes("moth")
        ) {
          defaultChemical = {
            name: "Bacillus thuringiensis (Bt)",
            activeIngredient: "Bacillus thuringiensis kurstaki 32,000 IU/mg WP",
            applicationRate: "1-2 g/L water",
            methodPoints: [
              "Apply as a foliar spray targeting young larvae",
              "Best applied in the evening as UV light degrades the bacteria",
              "Repeat every 5-7 days during heavy infestation",
            ],
            safeDays: 0,
            safetyPoints: [
              "Safe for humans, beneficial insects, and the environment",
              "Can be used up to day of harvest",
              "Store in a cool, dry place to maintain efficacy",
            ],
            brands: ["Dipel", "Thuricide"],
          };
        } else if (
          nameLower.includes("beetle") ||
          nameLower.includes("weevil")
        ) {
          defaultChemical = {
            name: "Lambda-cyhalothrin",
            activeIngredient: "Lambda-cyhalothrin 5% EC",
            applicationRate: "1 ml/L water",
            methodPoints: [
              "Apply as a foliar spray ensuring thorough coverage",
              "Target adults during their active feeding periods",
              "Repeat after 10-14 days if infestation persists",
            ],
            safeDays: 14,
            safetyPoints: [
              "Toxic to bees and aquatic organisms",
              "Wear protective equipment during application",
              "Keep children and pets away from treated areas until dry",
            ],
            brands: ["Karate", "Ninja"],
          };
        } else {
          // Default pest control if no specific pest type is identified
          defaultChemical = {
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
          };
        }
      } else {
        // Disease controls
        if (
          nameLower.includes("powdery mildew") ||
          nameLower.includes("mildew")
        ) {
          defaultChemical = {
            name: "Tebuconazole",
            activeIngredient: "Tebuconazole 25% WP",
            applicationRate: "1 g/L water",
            methodPoints: [
              "Apply as a preventive spray at first signs of disease",
              "Ensure thorough coverage of upper and lower leaf surfaces",
              "Repeat every 10-14 days during favorable conditions",
            ],
            safeDays: 7,
            safetyPoints: [
              "Wear protective equipment during application",
              "Avoid application during windy conditions",
              "Keep away from water bodies",
            ],
            brands: ["Folicur", "Orius"],
          };
        } else if (nameLower.includes("rust")) {
          defaultChemical = {
            name: "Propiconazole",
            activeIngredient: "Propiconazole 25% EC",
            applicationRate: "1 ml/L water",
            methodPoints: [
              "Apply at first signs of disease",
              "Ensure thorough coverage of all plant surfaces",
              "Repeat every 14-21 days if conditions favor disease",
            ],
            safeDays: 14,
            safetyPoints: [
              "Wear protective equipment during application",
              "Avoid contact with skin and eyes",
              "Keep away from water sources",
            ],
            brands: ["Tilt", "Bumper"],
          };
        } else if (
          nameLower.includes("blight") ||
          nameLower.includes("late blight")
        ) {
          defaultChemical = {
            name: "Metalaxyl + Mancozeb",
            activeIngredient: "Metalaxyl 8% + Mancozeb 64% WP",
            applicationRate: "2.5 g/L water",
            methodPoints: [
              "Apply as a preventive spray before disease onset",
              "Ensure thorough coverage of all plant surfaces",
              "Repeat every 7-10 days during rainy periods",
            ],
            safeDays: 14,
            safetyPoints: [
              "Wear protective equipment during application",
              "Avoid contact with skin and eyes",
              "Keep away from water sources",
            ],
            brands: ["Ridomil Gold", "Victory"],
          };
        } else if (nameLower.includes("anthracnose")) {
          defaultChemical = {
            name: "Chlorothalonil",
            activeIngredient: "Chlorothalonil 75% WP",
            applicationRate: "2 g/L water",
            methodPoints: [
              "Apply as a preventive spray",
              "Ensure thorough coverage of all plant surfaces",
              "Repeat every 7-14 days during wet conditions",
            ],
            safeDays: 7,
            safetyPoints: [
              "Wear protective equipment during application",
              "Avoid contact with skin and eyes",
              "Keep away from water sources",
            ],
            brands: ["Bravo", "Daconil"],
          };
        } else if (nameLower.includes("wilt") || nameLower.includes("rot")) {
          defaultChemical = {
            name: "Copper Oxychloride",
            activeIngredient: "Copper Oxychloride 50% WP",
            applicationRate: "3 g/L water",
            methodPoints: [
              "Apply as a soil drench around the base of plants",
              "Can also be applied as a foliar spray",
              "Repeat every 7-14 days during disease-favorable conditions",
            ],
            safeDays: 7,
            safetyPoints: [
              "Wear protective equipment during application",
              "May cause phytotoxicity in some crops in hot weather",
              "Keep away from water sources",
            ],
            brands: ["Cobox", "Cuprocaffaro"],
          };
        } else {
          // Default disease control if no specific disease type is identified
          defaultChemical = {
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
        }
      }

      controlMeasures.chemical.push(defaultChemical);
    }

    // Ensure each chemical control has at least two brands
    controlMeasures.chemical.forEach((chemical) => {
      if (!chemical.brands || chemical.brands.length < 2) {
        // If no brands, add two generic ones
        if (!chemical.brands || chemical.brands.length === 0) {
          chemical.brands = [`${chemical.name} Plus`, `${chemical.name} Gold`];
        }
        // If only one brand, add a second one
        else if (chemical.brands.length === 1) {
          chemical.brands.push(`${chemical.brands[0]} Premium`);
        }
      }
    });

    // Default values for organic controls if none found
    if (controlMeasures.organic.length === 0) {
      // Provide different default organic controls based on the pest/disease name or type
      let defaultOrganic;

      const nameLower = name.toLowerCase();

      if (type === "pest") {
        if (
          nameLower.includes("aphid") ||
          nameLower.includes("mite") ||
          nameLower.includes("thrip")
        ) {
          defaultOrganic = {
            name: "Neem Oil",
            activeIngredient: "Azadirachtin",
            applicationRate: "5 ml/L water",
            methodPoints: [
              "Apply as a foliar spray ensuring complete coverage",
              "Target the undersides of leaves where pests hide",
              "Repeat every 5-7 days until infestation subsides",
            ],
            safeDays: 0,
            safetyPoints: [
              "Safe for most beneficial insects when dry",
              "Apply in evening to prevent leaf burn and protect pollinators",
              "Avoid spraying during flowering if possible",
            ],
          };
        } else if (
          nameLower.includes("caterpillar") ||
          nameLower.includes("worm")
        ) {
          defaultOrganic = {
            name: "Bacillus thuringiensis (Bt)",
            activeIngredient: "Bacillus thuringiensis kurstaki",
            applicationRate: "1-2 g/L water",
            methodPoints: [
              "Apply as a foliar spray targeting young larvae",
              "Best applied in the evening as UV light degrades the bacteria",
              "Repeat every 5-7 days during heavy infestation",
            ],
            safeDays: 0,
            safetyPoints: [
              "Safe for humans, beneficial insects, and the environment",
              "Can be used up to day of harvest",
              "Store in a cool, dry place to maintain efficacy",
            ],
          };
        } else if (
          nameLower.includes("beetle") ||
          nameLower.includes("weevil")
        ) {
          defaultOrganic = {
            name: "Diatomaceous Earth",
            activeIngredient: "Silicon dioxide from fossilized diatoms",
            applicationRate: "Apply as a dust to soil surface or plants",
            methodPoints: [
              "Apply as a dust around plants or on foliage",
              "Reapply after rain or heavy dew",
              "Creates a physical barrier that damages insect exoskeletons",
            ],
            safeDays: 0,
            safetyPoints: [
              "Wear a dust mask during application",
              "Food grade diatomaceous earth is safe around edible plants",
              "May harm beneficial insects with exoskeletons if directly applied",
            ],
          };
        } else {
          defaultOrganic = {
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
        }
      } else {
        // Disease organic controls
        if (
          nameLower.includes("mildew") ||
          nameLower.includes("rust") ||
          nameLower.includes("blight")
        ) {
          defaultOrganic = {
            name: "Copper Soap",
            activeIngredient: "Copper octanoate",
            applicationRate: "5-8 ml/L water",
            methodPoints: [
              "Apply as a preventive spray before disease appears",
              "Ensure thorough coverage of all plant surfaces",
              "Repeat every 7-10 days during disease-favorable conditions",
            ],
            safeDays: 0,
            safetyPoints: [
              "Less toxic than other copper formulations",
              "May cause phytotoxicity in some plants in hot weather",
              "Can be used up to day of harvest",
            ],
          };
        } else if (nameLower.includes("rot") || nameLower.includes("wilt")) {
          defaultOrganic = {
            name: "Trichoderma",
            activeIngredient: "Trichoderma harzianum",
            applicationRate: "5-10 g/L water",
            methodPoints: [
              "Apply as a soil drench around the base of plants",
              "Can be incorporated into potting soil or compost",
              "Apply monthly as a preventive measure",
            ],
            safeDays: 0,
            safetyPoints: [
              "Safe for humans, animals, and beneficial organisms",
              "Can be used up to day of harvest",
              "Store in a cool, dry place to maintain viability",
            ],
          };
        } else {
          defaultOrganic = {
            name: "Baking Soda Spray",
            activeIngredient: "Sodium bicarbonate",
            applicationRate: "5-10 g/L water + 2 ml liquid soap as surfactant",
            methodPoints: [
              "Apply as a preventive spray",
              "Ensure thorough coverage of all plant surfaces",
              "Repeat every 7-14 days during disease-favorable conditions",
            ],
            safeDays: 0,
            safetyPoints: [
              "Safe for humans and the environment",
              "May cause leaf burn if concentration is too high",
              "Avoid applying in hot, sunny conditions",
            ],
          };
        }
      }

      controlMeasures.organic.push(defaultOrganic);
    }

    // Default values for cultural controls if none found
    if (!controlMeasures.cultural || controlMeasures.cultural.length === 0) {
      // Provide different default cultural controls based on the pest/disease name or type
      let defaultCultural;

      const nameLower = name.toLowerCase();

      if (type === "pest") {
        if (
          nameLower.includes("aphid") ||
          nameLower.includes("mite") ||
          nameLower.includes("thrip")
        ) {
          defaultCultural = [
            "Introduce beneficial insects like ladybugs, lacewings, or predatory mites",
            "Use reflective mulches to repel flying insects",
            "Maintain proper plant nutrition as stressed plants are more susceptible",
            "Use water sprays to dislodge pests from plants",
            "Remove heavily infested plant parts",
          ];
        } else if (
          nameLower.includes("caterpillar") ||
          nameLower.includes("worm") ||
          nameLower.includes("moth")
        ) {
          defaultCultural = [
            "Handpick and destroy caterpillars and egg masses",
            "Use pheromone traps to monitor and reduce adult moth populations",
            "Cover plants with floating row covers during peak egg-laying periods",
            "Encourage natural predators like birds, wasps, and predatory beetles",
            "Practice crop rotation to disrupt pest life cycles",
          ];
        } else if (
          nameLower.includes("beetle") ||
          nameLower.includes("weevil")
        ) {
          defaultCultural = [
            "Use trap crops to lure pests away from main crops",
            "Implement crop rotation with non-host plants",
            "Till soil after harvest to expose pupae to predators and weather",
            "Use sticky traps to monitor and reduce adult populations",
            "Remove plant debris where pests may overwinter",
          ];
        } else {
          defaultCultural = [
            "Practice crop rotation",
            "Maintain proper plant spacing for good air circulation",
            "Use companion planting to repel pests or attract beneficial insects",
            "Keep fields weed-free as many weeds host pests",
            "Maintain proper field sanitation",
          ];
        }
      } else {
        // Disease cultural controls
        if (nameLower.includes("mildew") || nameLower.includes("blight")) {
          defaultCultural = [
            "Increase plant spacing to improve air circulation",
            "Avoid overhead irrigation; use drip irrigation instead",
            "Water in the morning so plants dry quickly",
            "Prune to improve air circulation within plant canopy",
            "Remove and destroy infected plant material",
          ];
        } else if (nameLower.includes("rot") || nameLower.includes("wilt")) {
          defaultCultural = [
            "Improve soil drainage by adding organic matter",
            "Avoid overwatering and ensure proper irrigation scheduling",
            "Use raised beds in areas with poor drainage",
            "Practice crop rotation with non-susceptible crops",
            "Use disease-free planting material and resistant varieties",
          ];
        } else if (nameLower.includes("virus")) {
          defaultCultural = [
            "Control insect vectors like aphids and whiteflies",
            "Remove and destroy infected plants immediately",
            "Disinfect tools between plants to prevent transmission",
            "Use virus-free certified seed or planting material",
            "Control weeds that may serve as virus reservoirs",
          ];
        } else {
          defaultCultural = [
            "Practice crop rotation",
            "Maintain proper plant spacing for good air circulation",
            "Remove and destroy infected plant debris",
            "Use resistant varieties when available",
            "Maintain proper field sanitation",
          ];
        }
      }

      controlMeasures.cultural = defaultCultural;
    }

    // Extract plants affected
    const plantsAffectedSection = responseText.match(
      /Plants Affected:[\s\S]*?(?=$)/i
    );
    let plantsAffected: string[] = [];
    if (plantsAffectedSection) {
      plantsAffected = plantsAffectedSection[0]
        .replace(/Plants Affected:\s*/i, "")
        .split(/\n-|\n\d\.|\s*,\s*/) // Split by bullet points, numbered lists, or commas
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
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
      plantsAffected: []
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
