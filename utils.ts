
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// @ts-ignore
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export const getRandomStyle = (): string => {
  const styles = [
    "etched in pure gold on a background of deep emerald velvet",
    "glowing stars forming a celestial constellation in a nebula",
    "carved into white marble with sunbeams filtering through ancient arches",
    "illuminated manuscript style with intricate floral borders and gold leaf",
    "reflected in a still holy pool surrounded by morning mist",
    "formed by bioluminescent sea creatures in a deep turquoise ocean",
    "etched in crystal with prisms of light scattering rainbows",
    "written in the clouds during a vibrant sunset over a calm sea",
    "formed by ancient sand patterns in a serene moonlit desert",
    "glowing as soft light particles in a quiet, dark sanctuary"
  ];
  return styles[Math.floor(Math.random() * styles.length)];
};

export const cleanBase64 = (data: string): string => {
  return data.replace(/^data:.*,/, '');
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const createGifFromVideo = async (videoUrl: string): Promise<Blob> => {
  if (typeof GIFEncoder !== 'function') {
    throw new Error("GIF library error.");
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = "anonymous";
    video.src = videoUrl;
    video.muted = true;
    
    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 3; 
        const width = 320; 
        let height = Math.floor((video.videoHeight / video.videoWidth) * width);
        if (height % 2 !== 0) height -= 1;

        const fps = 8;
        const totalFrames = Math.floor(duration * fps);
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error("Canvas failure");

        const gif = GIFEncoder();
        
        for (let i = 0; i < totalFrames; i++) {
          await new Promise(r => setTimeout(r, 0));
          video.currentTime = (i / fps);
          
          await new Promise<void>((r) => {
             const handler = () => {
               video.removeEventListener('seeked', handler);
               r();
             };
             video.addEventListener('seeked', handler);
          });
          
          ctx.drawImage(video, 0, 0, width, height);
          const { data } = ctx.getImageData(0, 0, width, height);
          const palette = quantize(data, 256);
          const index = applyPalette(data, palette);
          gif.writeFrame(index, width, height, { palette, delay: 1000 / fps });
        }
        
        gif.finish();
        resolve(new Blob([gif.bytes()], { type: 'image/gif' }));
      } catch (e) {
        reject(e);
      }
    };
    video.load(); 
  });
};

export const TYPOGRAPHY_SUGGESTIONS = [
  { id: 'thuluth', label: 'Thuluth Script', prompt: 'Elegant Thuluth Arabic calligraphy style, flowing and interconnected' },
  { id: 'kufic', label: 'Square Kufic', prompt: 'Geometric and modern Square Kufic calligraphy, architectural and bold' },
  { id: 'diwani', label: 'Diwani Royal', prompt: 'Ornate and flowing Diwani calligraphy, graceful curves and flourishes' },
  { id: 'gold-leaf', label: 'Gold Leaf', prompt: 'Thick, dimensional gold leaf typography with high-shine metallic finish' },
  { id: 'ethereal-light', label: 'Ethereal Light', prompt: 'Soft, glowing letters made of pure light and white particles' },
  { id: 'engraved-stone', label: 'Engraved', prompt: 'Deeply engraved typography in polished grey granite or marble' },
  { id: 'celestial-serif', label: 'Celestial Serif', prompt: 'Tall, elegant serif typography with thin lines and high contrast' },
  { id: 'nature-floral', label: 'Floral Bound', prompt: 'Typography intertwined with delicate white flowers and green vines' },
];
