// src/app/models/document.model.ts
export interface Document {
    key: string;
    fileName: string;
    size: number;
    lastModified: Date;
  }