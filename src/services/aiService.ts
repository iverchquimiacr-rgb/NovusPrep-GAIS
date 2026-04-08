import { GoogleGenAI } from "@google/genai";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { DEFAULT_AI_KNOWLEDGE } from "../data/defaultAiKnowledge";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

/**
 * Sends a message to the Gemini AI and gets a response based on the knowledge base.
 */
export const sendChatMessage = async (
  message: string,
  history: ChatMessage[]
): Promise<string> => {
  try {
    // Fetch knowledge base from Firestore
    const docRef = doc(db, 'settings', 'ai_knowledge');
    const docSnap = await getDoc(docRef);
    let knowledgeBase = DEFAULT_AI_KNOWLEDGE;
    
    if (docSnap.exists() && docSnap.data().content) {
      knowledgeBase = docSnap.data().content;
    }

    const systemInstruction = `
      Eres un asesor académico experto y empático de la plataforma de estudios NovusPrep.
      Tu objetivo es ayudar a los estudiantes a elegir la carpeta de estudio adecuada según sus necesidades, nivel y situación.
      
      BASE DE CONOCIMIENTO (Catálogo detallado de carpetas, cursos y temas):
      ${knowledgeBase}
      
      REGLAS DE COMPORTAMIENTO:
      1. Sé amable, conversacional y directo. Habla en primera persona ("Te recomiendo...", "Veo que necesitas...").
      2. Basa tus recomendaciones ÚNICAMENTE en la base de conocimiento proporcionada.
      3. LECTURA DE ETIQUETAS: Presta especial atención a las palabras clave o etiquetas que el administrador ha puesto en la base de conocimiento, tales como [teoría], [práctica], [material], [llaveros], [folletos], etc. Usa estas etiquetas para filtrar exactamente lo que el alumno pide.
      4. GENERALIZACIÓN DE MATERIAS: Si un alumno pregunta por una materia general (ej. "matemáticas" o "letras"), debes ser capaz de deducir y sugerir cursos relacionados que estén en el catálogo. Por ejemplo, para "matemáticas", sugiere aritmética, trigonometría, geometría, matemática 1, matemática 2, etc., siempre y cuando existan en la base de conocimiento.
      5. PRECIOS Y PLANES: Si te preguntan por precios, revisa la sección "# PRECIOS Y PLANES" o los títulos de los ciclos (ej. "## Ciclo Repaso (S/.7)") y dales el costo exacto.
      6. BÚSQUEDAS CRUZADAS: Si te preguntan por una materia en un ciclo específico (ej. "Química en el ciclo repaso"), busca la sección de ese ciclo y enumera los temas que hay en esa materia usando viñetas.
      7. No inventes carpetas ni cursos que no estén en la base de conocimiento.
      8. Mantén tus respuestas concisas, estructuradas y fáciles de leer (usa viñetas o negritas para resaltar nombres de carpetas o cursos).
    `;

    // Convert history to Gemini format
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "Lo siento, no pude procesar tu solicitud en este momento.";

  } catch (error) {
    console.error("Error in AI chat:", error);
    throw new Error("No se pudo conectar con el asistente en este momento.");
  }
};
