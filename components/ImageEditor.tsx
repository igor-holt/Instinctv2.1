import React, { useState, useRef } from 'react';
import { Icons } from './Icons';
import { editImageWithGenAI } from '../services/geminiService';

export const ImageEditor = () => {
    // Whitelist of allowed image MIME types
    const ALLOWED_MIME_TYPES = new Set([
        'image/png',
        'image/jpeg',
       'image/jpg',
       'image/gif',
       'image/bmp',
       'image/webp',
       'image/svg+xml'
   ]);
   const [image, setImage] = useState<string | null>(null);
   const [mimeType, setMimeType] = useState<string>('image/png');
   const [prompt, setPrompt] = useState('');
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Only allow safe image mime types; otherwise, default to image/png
        const safeMimeType = ALLOWED_MIME_TYPES.has(file.type) ? file.type : 'image/png';
        setMimeType(safeMimeType);

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove data URL prefix for API
            setImage(base64String.split(',')[1]); 
            setProcessedImage(null); // Reset prev result
        };
        reader.readAsDataURL(file);
    };

    const handleEdit = async () => {
        if (!image || !prompt.trim()) return;

        setIsLoading(true);
        const result = await editImageWithGenAI(image, prompt, mimeType);
        if (result) {
            setProcessedImage(result);
        } else {
            alert("Image processing failed or no result returned.");
        }
        setIsLoading(false);
    };

    return (
        <div className="glass-panel rounded-lg p-6 animate-in fade-in">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded bg-pink-900/30 text-pink-400">
                    <Icons.Image className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Visual Sensor Cortex</h2>
                    <p className="text-slate-400 text-sm">Manipulate visual feed via Nano-Banana (Gemini Flash Image) protocols.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-700 hover:border-pink-500/50 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/50 relative overflow-hidden"
                    >
                        {image ? (
                            <img 
                                src={`data:${mimeType};base64,${image}`} 
                                alt="Input" 
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="text-center text-slate-500">
                                <Icons.Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <span className="text-sm">Upload Sensor Feed</span>
                            </div>
                        )}
                        <input 
                            ref={fileInputRef} 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />
                    </div>

                    <div className="flex gap-2">
                         <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Command: e.g., 'Enhance contrast', 'Remove obstruction'"
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                        />
                        <button 
                            onClick={handleEdit}
                            disabled={isLoading || !image}
                            className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                        >
                            {isLoading ? <Icons.RefreshCw className="w-4 h-4 animate-spin" /> : <Icons.Zap className="w-4 h-4" />}
                            Execute
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                <div className="border border-slate-700 rounded-lg h-64 md:h-auto bg-slate-900/50 flex items-center justify-center relative">
                    {processedImage ? (
                        <img 
                            src={processedImage} 
                            alt="Processed" 
                            className="w-full h-full object-contain"
                        />
                    ) : (
                         <div className="text-center text-slate-600">
                            <Icons.Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <span className="text-sm">Awaiting Processed Output</span>
                        </div>
                    )}
                    {isLoading && (
                        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-2 text-pink-400">
                                <Icons.RefreshCw className="w-8 h-8 animate-spin" />
                                <span className="text-xs font-mono animate-pulse">APPLYING TRANSFORMS...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};