
import { GoogleGenAI, Type } from "@google/genai";
import { CustomerData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini to parse raw text or table data into structured customer information.
 */
export const geocodeAddresses = async (customers: Partial<CustomerData>[]): Promise<CustomerData[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse the following customer data for a CRM system. Convert the addresses into likely latitude and longitude coordinates in South Korea. 
    Ensure the output is a valid JSON array of objects.
    Data: ${JSON.stringify(customers)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            phone: { type: Type.STRING },
            address: { type: Type.STRING },
            memo: { type: Type.STRING },
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
            status: { type: Type.STRING }
          },
          required: ["id", "name", "address", "lat", "lng"]
        }
      }
    }
  });

  try {
    const parsed = JSON.parse(response.text);
    return parsed.map((p: any) => ({
      ...p,
      status: p.status || 'pending'
    }));
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return customers.map(c => ({
      ...c,
      id: c.id || Math.random().toString(36).substr(2, 9),
      status: 'pending',
      lat: c.lat || 37.5665,
      lng: c.lng || 126.9780
    })) as CustomerData[];
  }
};
