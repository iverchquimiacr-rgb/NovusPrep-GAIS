import React from 'react';
import { BookOpen, Calendar, Clock, Sun, Calculator, Library, Book, Layers, FileText, Folder, Edit3, GraduationCap } from 'lucide-react';

export const getFolderIcon = (name: string, className?: string) => {
  const lcName = name.toLowerCase();
  if (lcName.includes('anual')) return <Calendar className={className} />;
  if (lcName.includes('repaso')) return <Edit3 className={className} />;
  if (lcName.includes('verano')) return <Sun className={className} />;
  if (lcName.includes('examen') || lcName.includes('admisión')) return <FileText className={className} />;
  if (lcName.includes('libro')) return <Library className={className} />;
  if (lcName.includes('ceprequintos') || lcName.includes('colegio')) return <GraduationCap className={className} />;
  if (lcName.includes('ceprunsa') || lcName.includes('cepre')) return <Book className={className} />;
  if (lcName.includes('ciencias')) return <Calculator className={className} />;
  if (lcName.includes('general') || lcName.includes('resumen')) return <Layers className={className} />;
  return <Folder className={className} />;
};
