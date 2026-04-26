import React from 'react';
import { QrCodeGeneratorApp } from './QrCodeGeneratorApp';
import { AiParaphraserApp } from './AiParaphraserApp';
import { TechStackDetectorApp } from './TechStackDetectorApp';
import { PasswordGeneratorApp } from './PasswordGeneratorApp';

// 5. QR Code Generator with Customization
export function QRCodeAdvanced() {
   return <QrCodeGeneratorApp />;
}

// 6. AI Paraphraser / Grammar Fixer
export function AIParaphraser() {
   return <AiParaphraserApp />;
}

// 7. Tech Stack Detector
export function TechStackDetector() {
   return <TechStackDetectorApp />;
}

// 8. Password Generator (Light UI Variant)
export function PasswordGenLight() {
  return <PasswordGeneratorApp />;
}
