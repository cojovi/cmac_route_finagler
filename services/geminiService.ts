
import { GoogleGenAI, Type } from "@google/genai";
import { OptimizedRoute, Address } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const routeSchema = {
    type: Type.OBJECT,
    properties: {
        optimized_route: {
            type: Type.ARRAY,
            description: "The list of stops in the most optimal order. Each item should be an object containing the address, estimated arrival time, and estimated departure time. The route should be a round trip, starting and ending at the first address.",
            items: {
                type: Type.OBJECT,
                properties: {
                    address: { type: Type.STRING, description: "The address of the stop." },
                    estimated_arrival_time: { type: Type.STRING, description: "Estimated time of arrival (e.g., '10:15 AM'). For the start, can be 'Start'." },
                    estimated_departure_time: { type: Type.STRING, description: "Estimated time of departure (e.g., '10:45 AM'). For the end, can be 'Finish'." }
                },
                required: ["address", "estimated_arrival_time", "estimated_departure_time"]
            }
        },
        total_distance: {
            type: Type.STRING,
            description: "The total estimated travel distance for the entire route in kilometers or miles (e.g., '125 km')."
        },
        total_time: {
            type: Type.STRING,
            description: "The total estimated duration for the entire trip, INCLUDING driving time and time spent at each stop (e.g., '4 hours 15 minutes')."
        },
        summary: {
            type: Type.STRING,
            description: "A friendly, concise, natural language paragraph summarizing the trip plan. Mention number of stops, total duration including stops, and total distance. If there was a timed appointment, confirm the route is optimized for it."
        }
    },
    required: ["optimized_route", "total_distance", "total_time", "summary"]
};


export const optimizeRoute = async (addresses: Address[], timedStopId: number | null): Promise<OptimizedRoute> => {
    
    let timeConstraintPrompt = '';
    if (timedStopId !== null) {
        const timedStop = addresses.find(addr => addr.id === timedStopId);
        if (timedStop && timedStop.value.trim() && timedStop.time) {
        timeConstraintPrompt = `
        IMPORTANT: There is a scheduled appointment. This is a hard constraint. The route must be optimized to ensure the user arrives at "${timedStop.value}" at or slightly before ${timedStop.time}. All other stops must be scheduled around this appointment.
        `;
        }
    }

    const prompt = `
        You are a logistics expert specializing in route optimization. Your task is to solve the Traveling Salesperson Problem for the given list of addresses, considering the time spent at each stop.
        The user wants the most time-efficient route starting from the first address in the list, visiting all other addresses, and returning to the start.
        You must account for the "dwell time" (time spent at each location) in your calculations for total trip time and arrival/departure estimates.
        ${timeConstraintPrompt}
        
        Please provide the following:
        1.  The optimal order of the stops, including estimated arrival and departure times for each. The first address should be the start and end point of the trip.
        2.  The total estimated driving distance.
        3.  The total estimated trip duration, which includes both driving time AND time spent at all stops.
        4.  A brief, helpful summary of the optimized trip, acknowledging any time constraints if provided.

        Here is the list of stops to optimize, with the planned duration at each stop:
        ${addresses.map((addr, i) => `${i + 1}. ${addr.value} (Time to spend: ${addr.duration} minutes)`).join('\n')}

        Return your answer ONLY in a valid JSON format that adheres to the provided schema. Do not include any other text or explanations outside of the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: routeSchema,
            }
        });

        const jsonText = response.text.trim();
        const result: OptimizedRoute = JSON.parse(jsonText);
        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('429')) {
             throw new Error("The service is currently busy. Please try again in a moment.");
        }
        throw new Error("Failed to optimize the route. The addresses may be invalid or the service could be temporarily unavailable.");
    }
};