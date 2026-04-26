import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Image as ImageIcon, Check, Wand2, Search, Link as LinkIcon, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { PDFDocument } from 'pdf-lib';
import { removeBackground } from '@imgly/background-removal';
import { GoogleGenAI } from '@google/genai';
import { QRCodeSVG } from 'qrcode.react';
import { ResumeBuilderApp } from './ResumeBuilderApp';
import { ImageConverterApp } from './ImageConverterApp';
import { BackgroundRemoverApp } from './BackgroundRemoverApp';
import { PdfCompressorApp } from './PdfCompressorApp';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// 1. PDF Compressor (Basic Metadata / Stream Optimizer)
export function PdfCompressor() {
  return <PdfCompressorApp />;
}

// 2. Resume Builder (Basic Template -> Print to PDF wrapper)
export function ResumeBuilder() {
  return <ResumeBuilderApp />;
}

// 3. AI Background Remover
export function BackgroundRemover() {
   return <BackgroundRemoverApp />;
}

// 4. Image Converter
export function ImageConverter() {
   return <ImageConverterApp />;
}
