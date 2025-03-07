/**
 * Agricultural response database for common farming questions
 */

export interface AgricultureResponse {
  keywords: string[];
  response: string;
}

export const agricultureResponses: AgricultureResponse[] = [
  // Soil Management
  {
    keywords: ["soil", "compost", "organic matter", "ph", "fertility"],
    response:
      "For healthy soil, maintain a pH between 6.0-7.0 and add compost regularly. Test your soil annually and amend based on results. Organic matter should be 5-10% for optimal plant growth. Consider cover crops like clover or vetch to improve soil structure and add nitrogen naturally.",
  },

  // Pest Management
  {
    keywords: ["pest", "insect", "bug", "aphid", "caterpillar", "beetle"],
    response:
      "For sustainable pest management: 1) Identify the specific pest before treatment, 2) Use physical barriers like row covers when possible, 3) Introduce beneficial insects like ladybugs or lacewings, 4) Apply organic pesticides only when necessary. Neem oil, insecticidal soap, and diatomaceous earth are effective organic options for many common pests.",
  },

  // Water Management
  {
    keywords: ["water", "irrigation", "drought", "moisture", "watering"],
    response:
      "Water deeply but infrequently to encourage deep root growth. Most crops need 1-1.5 inches of water weekly. Water early morning to reduce evaporation and fungal issues. Consider drip irrigation for 30-50% water savings. Mulch around plants with straw or wood chips to retain soil moisture and reduce watering needs.",
  },

  // Fertilizer and Nutrients
  {
    keywords: [
      "fertilizer",
      "nutrient",
      "nitrogen",
      "phosphorus",
      "potassium",
      "npk",
    ],
    response:
      "Apply balanced fertilizer (10-10-10) for general growth. Use nitrogen-rich fertilizer for leafy growth, phosphorus for root development, and potassium for fruit production. Always follow package instructions for application rates. Consider organic alternatives like compost tea, fish emulsion, or bone meal for specific nutrient needs.",
  },

  // Crop Rotation
  {
    keywords: ["rotation", "crop rotation", "planting schedule"],
    response:
      "Implement crop rotation to prevent soil-borne diseases and nutrient depletion. Divide crops into families: 1) Legumes (beans, peas), 2) Brassicas (cabbage, broccoli), 3) Solanaceae (tomatoes, peppers), 4) Cucurbits (squash, cucumbers), 5) Alliums (onions, garlic). Rotate these families through different areas each season, waiting 3-4 years before returning a family to the same location.",
  },

  // Specific Crops - Maize/Corn
  {
    keywords: ["maize", "corn", "zea mays"],
    response:
      "For successful maize cultivation: 1) Plant when soil temperatures reach 60°F (16°C), 2) Space rows 75-90cm apart with 25-30cm between plants, 3) Apply nitrogen-rich fertilizer when plants are knee-high, 4) Ensure consistent moisture during tasseling and silking stages, 5) Control weeds early as maize is sensitive to competition, 6) Monitor for fall armyworm and corn borer. Most varieties mature in 90-120 days depending on type.",
  },

  // Specific Crops - Tomatoes
  {
    keywords: ["tomato", "tomatoes"],
    response:
      "For healthy tomatoes: 1) Plant after all frost danger has passed, 2) Space 45-60cm apart in full sun, 3) Provide support with stakes or cages, 4) Water consistently at soil level to prevent leaf diseases, 5) Apply calcium to prevent blossom end rot, 6) Prune suckers for indeterminate varieties, 7) Monitor for early/late blight and septoria leaf spot. Harvest when fruits are firm and fully colored.",
  },

  // Specific Crops - Potatoes
  {
    keywords: ["potato", "potatoes"],
    response:
      "For growing potatoes: 1) Plant seed potatoes 10-15cm deep when soil reaches 7°C, 2) Space 30cm apart in rows 75cm apart, 3) Hill soil around plants as they grow to prevent greening, 4) Maintain consistent moisture, 5) Monitor for Colorado potato beetle and late blight, 6) Harvest after plants die back for storage potatoes or earlier for 'new' potatoes. Most varieties mature in 70-120 days.",
  },

  // Specific Crops - Beans
  {
    keywords: ["bean", "beans", "legume"],
    response:
      "For bean cultivation: 1) Plant after soil warms to 16°C and all frost danger has passed, 2) Sow seeds 2-5cm deep, 3) Space bush beans 10cm apart, pole beans 15cm apart, 4) Provide support for climbing varieties, 5) Avoid high-nitrogen fertilizers which promote foliage over pods, 6) Water consistently during flowering and pod development, 7) Harvest when pods are firm but before seeds bulge. Most varieties mature in 50-65 days.",
  },

  // Specific Varieties - H6213 Maize
  {
    keywords: ["h6213", "h6213 maize", "h6213 corn"],
    response:
      "To plant H6213 maize hybrid:\n\n1. Prepare soil by plowing to 20-30cm depth and harrow to fine tilth\n2. Plant at 75cm between rows and 25cm between plants (53,333 plants/ha)\n3. Plant 5cm deep in moist soil\n4. Apply DAP fertilizer at planting (50kg/ha)\n5. Top dress with CAN when knee-high (50kg/ha)\n6. Ensure regular weeding, especially in first 6 weeks\n7. Monitor for fall armyworm and stalk borer\n\nH6213 matures in 130-150 days depending on altitude and rainfall.",
  },

  // Organic Farming
  {
    keywords: ["organic", "natural farming", "no chemicals"],
    response:
      "For organic farming: 1) Build soil health with compost and cover crops, 2) Practice crop rotation and companion planting, 3) Use physical barriers and beneficial insects for pest control, 4) Apply organic-approved inputs like neem oil, Bt, or pyrethrin for severe pest issues, 5) Use mulch for weed suppression and water conservation, 6) Consider trap crops to divert pests from main crops, 7) Maintain biodiversity with flowering plants to attract beneficial insects.",
  },

  // Livestock Management
  {
    keywords: [
      "livestock",
      "cattle",
      "cow",
      "goat",
      "sheep",
      "chicken",
      "poultry",
    ],
    response:
      "For livestock management: 1) Ensure proper shelter with adequate ventilation, 2) Provide clean, fresh water at all times, 3) Feed a balanced diet appropriate for species, age, and production stage, 4) Implement rotational grazing for pasture animals, 5) Maintain regular health checks and vaccinations, 6) Practice good biosecurity to prevent disease spread, 7) Keep detailed records of breeding, health treatments, and production.",
  },

  // Climate-Smart Agriculture
  {
    keywords: ["climate", "drought", "flood", "resilience", "climate-smart"],
    response:
      "For climate-smart agriculture: 1) Diversify crops to spread risk, 2) Implement water harvesting and conservation techniques, 3) Use drought-tolerant crop varieties, 4) Build soil organic matter to improve water retention, 5) Establish windbreaks to reduce evaporation and erosion, 6) Consider agroforestry to create microclimates and additional income streams, 7) Monitor weather forecasts and adjust planting schedules accordingly.",
  },
];

/**
 * Find the most relevant agricultural response based on user query
 * @param query User's question or request
 * @returns The most appropriate response or null if no match
 */
export function findAgricultureResponse(query: string): string | null {
  if (!query) return null;

  const lowerQuery = query.toLowerCase();

  // First check for exact matches with specific varieties or techniques
  for (const response of agricultureResponses) {
    // Check for exact matches with specific varieties
    if (
      response.keywords.some(
        (keyword) => lowerQuery.includes(keyword) && keyword.includes(" "),
      )
    ) {
      return response.response;
    }
  }

  // Then check for general keyword matches
  let bestMatch: AgricultureResponse | null = null;
  let maxMatches = 0;

  for (const response of agricultureResponses) {
    const matches = response.keywords.filter((keyword) =>
      lowerQuery.includes(keyword),
    ).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = response;
    }
  }

  return bestMatch ? bestMatch.response : null;
}
