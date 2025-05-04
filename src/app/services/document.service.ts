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
    // Create form data to send the file
    const formData = new FormData();
    formData.append('file', file);
    
    // Set up query parameters with file information
    let params = new HttpParams()
      .set('action', 'uploadFile')
      .set('fileName', file.name)
      .set('contentType', file.type);
    
    // Set up headers WITHOUT content-type (let browser set it for multipart/form-data)
    const headers = new HttpHeaders();
    
    // Send the file directly to Lambda
    return this.http.post<any>(`${this.apiUrl}`, formData, {
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
  downloadFile(key: string, fileName: string): Observable<ArrayBuffer> {
    // Set up query parameters
    let params = new HttpParams()
      .set('action', 'downloadFile')
      .set('key', key);
    
    // Set up headers based on file type
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream'; // Default
    
    switch (fileExtension) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'txt':
        contentType = 'text/plain';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
    }
    
    // Set Accept header to match expected content type
    const headers = new HttpHeaders().set('Accept', contentType);
    
    // Request the file as arraybuffer
    return this.http.get(`${this.apiUrl}`, {
      params,
      headers,
      responseType: 'arraybuffer'
    });
  }

  /**
   * Handle file download and trigger browser save dialog
   */
  downloadAndSaveFile(key: string, fileName: string): void {
    this.downloadFile(key, fileName).subscribe({
      next: (data: ArrayBuffer) => {
        // Determine content type based on file extension
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream'; // Default
        
        switch (fileExtension) {
          case 'pdf':
            contentType = 'application/pdf';
            break;
          case 'docx':
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
          case 'xlsx':
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;
          case 'txt':
            contentType = 'text/plain';
            break;
          case 'jpg':
          case 'jpeg':
            contentType = 'image/jpeg';
            break;
          case 'png':
            contentType = 'image/png';
            break;
        }
        
        // Create a blob with the correct content type
        const blob = new Blob([data], { type: contentType });
        
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
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        alert('Failed to download the document. Please try again later.');
      }
    });
  }
}