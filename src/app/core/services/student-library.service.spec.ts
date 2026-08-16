// src/app/core/services/student-library.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentLibraryService } from './student-library.service';
import { MaterialStreamResponse } from '../models/student-library.model';

describe('StudentLibraryService', () => {
  let service: StudentLibraryService;
  let httpMock: HttpTestingController;

  const mockItems = [
    {
      materialId: 'mat-1',
      title: 'رياضيات الصف الثالث الثانوي',
      materialType: 'PDF',
      createdAt: '2026-08-16T04:00:00Z',
      currentVersion: {
        versionId: 'v1',
        versionNumber: 1,
        fileUrl: 'https://example.com/math.pdf',
        parseStatus: 'Parsed',
      },
    },
    {
      materialId: 'mat-2',
      title: 'محاضرة الفيزياء الحديثة',
      materialType: 'Video',
      createdAt: '2026-08-16T04:00:00Z',
      currentVersion: {
        versionId: 'v2',
        versionNumber: 1,
        fileUrl: 'https://example.com/physics.mp4',
        parseStatus: 'Parsed',
      },
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), StudentLibraryService],
    });
    service = TestBed.inject(StudentLibraryService);
    httpMock = TestBed.inject(HttpTestingController);

    // Handle initial constructor call
    const req = httpMock.match((r) => r.url.includes('/students/materials'));
    req.forEach((r) => r.flush({ items: mockItems, totalCount: 2 }));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have loaded books from API', () => {
    expect(service.books().length).toBe(2);
  });

  it('should filter books by search query', () => {
    service.setSearchQuery('فيزياء');
    expect(service.filteredBooks().length).toBe(1);
    expect(service.filteredBooks()[0].title).toContain('الفيزياء');
  });

  it('should filter books by material type', () => {
    service.setFilter('Video');
    const videos = service.filteredBooks();
    expect(videos.length).toBe(1);
    expect(videos[0].materialType).toBe('Video');

    service.setFilter('PDF');
    const pdfs = service.filteredBooks();
    expect(pdfs.length).toBe(1);
    expect(pdfs[0].materialType).toBe('PDF');
  });

  it('should fetch secure video stream URL via GET /materials/{id}/stream', () => {
    const mockStream: MaterialStreamResponse = {
      provider: 'Cloudinary',
      videoId: 'Teacher_Ahmed/Physics_101/video_1',
      streamUrl: 'https://res.cloudinary.com/demo/video_1.mp4',
      expiresAt: '2026-08-16T06:00:00Z',
    };

    service.getVideoStreamUrl('mat-2').subscribe((res) => {
      expect(res).toEqual(mockStream);
      expect(res?.streamUrl).toBe('https://res.cloudinary.com/demo/video_1.mp4');
    });

    const req = httpMock.expectOne((r) => r.url.includes('/materials/mat-2/stream'));
    expect(req.request.method).toBe('GET');
    req.flush(mockStream);
  });

  it('should return all loaded books when search query is empty', () => {
    service.setSearchQuery('');
    service.setFilter('ALL');
    expect(service.filteredBooks().length).toBe(2);
  });
});
