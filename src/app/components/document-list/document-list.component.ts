// src/app/components/document-list/document-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit, OnDestroy {
  documents: Document[] = [];
  isLoading = false;
  error = '';
  sortField = 'lastModified';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  private documentUploadedSubscription?: Subscription;

  constructor(private documentService: DocumentService) { }

  ngOnInit(): void {
    this.loadDocuments();
    
    // Listen for document upload events to refresh the list
    this.documentUploadedSubscription = new Subscription();
    const subscription = this.documentUploadedSubscription;
    
    if (subscription) {
      window.addEventListener('document-uploaded', () => {
        this.loadDocuments();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.documentUploadedSubscription) {
      this.documentUploadedSubscription.unsubscribe();
    }
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.error = '';
    
    this.documentService.listDocuments()
      .subscribe({
        next: (response) => {
          console.log('Documents loaded:', response.documents);  
          this.documents = response.documents.map(doc => ({
            ...doc,
            lastModified: new Date(doc.lastModified)
          }));
          this.sortDocuments(this.sortField, this.sortDirection);
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load documents. Please try again later.';
          console.error('Error loading documents:', err);
          this.isLoading = false;
        }
      });
  }

  downloadDocument(document: Document): void {
    try {
      this.documentService.downloadAndSaveFile(document.key, document.fileName);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download the document. Please try again later.');
    }
  }

  sortDocuments(field: string, direction: 'asc' | 'desc'): void {
    this.sortField = field;
    this.sortDirection = direction;
    
    this.documents.sort((a: any, b: any) => {
      const valueA = a[field];
      const valueB = b[field];
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      } else {
        return direction === 'asc' 
          ? valueA - valueB 
          : valueB - valueA;
      }
    });
  }

  toggleSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.sortDocuments(this.sortField, this.sortDirection);
  }

  getSortIndicator(field: string): string {
    if (this.sortField === field) {
      return this.sortDirection === 'asc' ? '↑' : '↓';
    }
    return '';
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'description';
      case 'docx':
        return 'article';
      case 'xlsx':
        return 'table_chart';
      case 'txt':
        return 'text_snippet';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image';
      default:
        return 'insert_drive_file';
    }
  }

  // Format file size to KB, MB, etc.
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  refreshDocuments(): void {
    this.loadDocuments();
  }
}