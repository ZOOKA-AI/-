
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { GoogleGenAI, Modality } from "@google/genai";
import { cleanBase64 } from "../utils";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please select your Gemini API key from the status bar.");
  }
  return new GoogleGenAI({ apiKey });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const createBlankImage = (width: number, height: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  }
  return cleanBase64(canvas.toDataURL('image/png'));
};

export const generateStyleSuggestion = async (text: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Research the spiritual and historical context of this text: "${text}". 
      Then, based on your findings, suggest a single, highly detailed visual art direction (20-30 words) for a cinematic animation. 
      Incorporate elements of sacred geometry, divine light, and symbolic textures that match the text's meaning.
      Output ONLY the visual description.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text?.trim() || "";
  } catch (e) {
    console.error("Failed to generate style suggestion", e);
    return "";
  }
};

interface TextImageOptions {
  text: string;
  style: string;
  typographyPrompt?: string;
  referenceImage?: string;
}

export const generateTextImage = async ({ text, style, typographyPrompt, referenceImage }: TextImageOptions): Promise<{ data: string, mimeType: string }> => {
  const ai = getAI();
  const parts: any[] = [];
  
  const typoInstruction = typographyPrompt && typographyPrompt.trim().length > 0 
    ? typographyPrompt 
    : "Elegant, spiritual calligraphy or refined modern typography. If the text is Arabic, use professional Thuluth or Kufic calligraphy styles. Perfectly legible.";

  if (referenceImage) {
    const [mimeTypePart, data] = referenceImage.split(';base64,');
    parts.push({
      inlineData: {
        data: data,
        mimeType: mimeTypePart.replace('data:', '')
      }
    });
    
    parts.push({ 
      text: `Using the visual aesthetic, lighting, and textures of this reference image, create a NEW cinematic masterpiece featuring the text: "${text}".
      Typography: ${typoInstruction}. 
      Environment: ${style}. 
      The text must feel integrated into the spiritual atmosphere of the scene.` 
    });
  } else {
    parts.push({ 
      text: `A high-resolution, spiritual, cinematic image featuring the text "${text}" in the center. 
      Typography Style: ${typoInstruction}. 
      Visual Style: ${style}. 
      The atmosphere should be serene, peaceful, and awe-inspiring. Use dramatic but soft lighting, intricate textures, and a harmonious color palette. 8k resolution.` 
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        },
        tools: [
          {
            googleSearch: {
              searchTypes: {
                webSearch: {},
                imageSearch: {},
              }
            },
          },
        ],
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return { 
          data: part.inlineData.data, 
          mimeType: part.inlineData.mimeType || 'image/png' 
        };
      }
    }
    throw new Error("No image was returned from the model.");
  } catch (error: any) {
    throw error;
  }
};

const pollForVideo = async (operation: any) => {
  const ai = getAI();
  let op = operation;
  const startTime = Date.now();
  const MAX_WAIT_TIME = 180000; 

  while (!op.done) {
    if (Date.now() - startTime > MAX_WAIT_TIME) {
      throw new Error("Meditation visualization timed out.");
    }
    await sleep(5000); 
    op = await ai.operations.getVideosOperation({ operation: op });
  }
  return op;
};

const fetchVideoBlob = async (uri: string) => {
  const response = await fetch(uri, {
    method: 'GET',
    headers: {
      'x-goog-api-key': process.env.API_KEY || '',
    },
  });
  if (!response.ok) throw new Error("Failed to download cinematic video.");
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateTTS = async (text: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say with deep spiritual reverence and peace: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio ? `data:audio/mp3;base64,${base64Audio}` : null;
  } catch (e) {
    console.error("TTS failed", e);
    return null;
  }
};

export const generateTextVideo = async (
  text: string, 
  imageBase64: string, 
  imageMimeType: string, 
  promptStyle: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  const ai = getAI();
  const cleanImageBase64 = cleanBase64(imageBase64);
  const startImage = createBlankImage(aspectRatio === '16:9' ? 1280 : 720, aspectRatio === '16:9' ? 720 : 1280);

  try {
    const revealPrompt = `Cinematic masterpiece. The sacred text "${text}" gracefully manifests through ethereal light and spiritual energy. ${promptStyle}. 
    High-end motion graphics, fluid transitions, particles of divine light, 8k resolution, professional cinematography. The animation should feel peaceful and awe-inspiring.`;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: revealPrompt,
      image: {
        imageBytes: startImage,
        mimeType: 'image/png'
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio,
        lastFrame: {
          imageBytes: cleanImageBase64,
          mimeType: imageMimeType
        }
      }
    });

    const op = await pollForVideo(operation);
    if (op.error) throw new Error(op.error.message);
    if (op.response?.generatedVideos?.[0]?.video?.uri) {
      return await fetchVideoBlob(op.response.generatedVideos[0].video.uri);
    }
  } catch (error: any) {
    throw error;
  }

  throw new Error("Failed to manifest the spiritual animation.");
};
