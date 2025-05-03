// src/app/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../models/document.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Upload a file directly to the Lambda function
   */
  uploadFile(file: File): Observable<any> {
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('file', file);
    
    // Set up query parameters with file information
    let params = new HttpParams()
      .set('action', 'uploadFile')
      .set('fileName', file.name)
      .set('contentType', file.type);
    
    // Set up headers
    const headers = new HttpHeaders({
      // No Content-Type header as it will be set automatically for FormData
    });
    
    // Send the file directly to Lambda
    return this.http.post<any>(`${this.apiUrl}`, file, {
      params,
      headers,
      responseType: 'json' as 'json'
    });
  }

  /**
   * List all documents
   */
  listDocuments(): Observable<{ documents: Document[] }> {
    return this.http.get<{ documents: Document[] }>(`${this.apiUrl}`, {
      params: { action: 'listDocuments' }
    });
  }

  /**
   * Download a file directly from Lambda
   * This triggers a file download
   */
  downloadFile(key: string, fileName: string): Observable<Blob> {
    // Set up query parameters
    console.log("Key: ", key);
    console.log("File Name: ", fileName);
    let params = new HttpParams()
      .set('action', 'downloadFile')
      .set('key', key);
    
    // Request the file as a blob
    return this.http.get(`${this.apiUrl}`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Handle file download and trigger browser save dialog
   */
  downloadAndSaveFile(key: string, fileName: string): void {
    this.downloadFile(key, fileName).subscribe(blob => {
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Append to body, trigger click, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Release the object URL
      window.URL.revokeObjectURL(url);
    });
  }
}