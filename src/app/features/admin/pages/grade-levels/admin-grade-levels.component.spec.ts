import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminGradeLevelsComponent } from './admin-grade-levels.component';
import { AdminGradeLevelService } from '../../services/admin-grade-level.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { GradeLevelDto } from '../../models/admin-grade-level.model';

describe('AdminGradeLevelsComponent', () => {
  let component: AdminGradeLevelsComponent;
  let fixture: ComponentFixture<AdminGradeLevelsComponent>;
  let serviceSpy: jasmine.SpyObj<AdminGradeLevelService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const mockLevels: GradeLevelDto[] = [
    {
      id: 'gl-1',
      name: 'الصف الأول الثانوي',
      description: 'المرحلة الثانوية',
      sortOrder: 1,
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'gl-2',
      name: 'الصف الثاني الثانوي',
      description: 'المرحلة الثانوية',
      sortOrder: 2,
      isActive: false,
      createdAt: '2026-01-02T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('AdminGradeLevelService', [
      'getAll',
      'create',
      'update',
      'deactivate',
    ]);
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    serviceSpy.getAll.and.returnValue(of(mockLevels));
    serviceSpy.create.and.returnValue(of({ ...mockLevels[0], id: 'gl-3' }));
    serviceSpy.update.and.returnValue(of(void 0));
    serviceSpy.deactivate.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [AdminGradeLevelsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: AdminGradeLevelService, useValue: serviceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminGradeLevelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the admin grade levels component', () => {
    expect(component).toBeTruthy();
  });

  it('should load grade levels on initialization', () => {
    expect(serviceSpy.getAll).toHaveBeenCalled();
    expect(component.gradeLevels().length).toBe(2);
    expect(component.filteredLevels().length).toBe(2);
  });

  it('should filter grade levels by search query', () => {
    component.onSearch('الأول');
    expect(component.filteredLevels().length).toBe(1);
    expect(component.filteredLevels()[0].name).toContain('الأول');
  });

  it('should open create modal with defaulted sort order', () => {
    component.openCreateModal();
    expect(component.isModalOpen()).toBeTrue();
    expect(component.isEditMode()).toBeFalse();
    expect(component.form.get('sortOrder')?.value).toBe(3);
  });

  it('should open edit modal populated with existing level details', () => {
    component.openEditModal(mockLevels[0]);
    expect(component.isModalOpen()).toBeTrue();
    expect(component.isEditMode()).toBeTrue();
    expect(component.form.get('name')?.value).toBe('الصف الأول الثانوي');
    expect(component.form.get('sortOrder')?.value).toBe(1);
  });

  it('should create a new grade level successfully', () => {
    component.openCreateModal();
    component.form.patchValue({
      name: 'الصف الثالث الثانوي',
      description: 'شهادة الثانوية العامة',
      sortOrder: 3,
      isActive: true,
    });

    component.saveLevel();
    expect(serviceSpy.create).toHaveBeenCalledWith({
      name: 'الصف الثالث الثانوي',
      description: 'شهادة الثانوية العامة',
      sortOrder: 3,
    });
    expect(toastSpy.success).toHaveBeenCalledWith('ADMIN.GRADE_LEVELS.SUCCESS_CREATED');
    expect(component.isModalOpen()).toBeFalse();
  });

  it('should update an existing grade level successfully', () => {
    component.openEditModal(mockLevels[0]);
    component.form.patchValue({
      name: 'الصف الأول الثانوي - عام',
      description: 'محدث',
      sortOrder: 1,
      isActive: true,
    });

    component.saveLevel();
    expect(serviceSpy.update).toHaveBeenCalledWith('gl-1', {
      name: 'الصف الأول الثانوي - عام',
      description: 'محدث',
      sortOrder: 1,
      isActive: true,
    });
    expect(toastSpy.success).toHaveBeenCalledWith('ADMIN.GRADE_LEVELS.SUCCESS_UPDATED');
    expect(component.isModalOpen()).toBeFalse();
  });

  it('should handle delete confirmation successfully', () => {
    component.promptDelete(mockLevels[0]);
    expect(component.isDeleteConfirmOpen()).toBeTrue();
    expect(component.itemToDelete()).toBe(mockLevels[0]);

    component.onConfirmDelete();
    expect(serviceSpy.deactivate).toHaveBeenCalledWith('gl-1');
    expect(toastSpy.success).toHaveBeenCalledWith('ADMIN.GRADE_LEVELS.SUCCESS_DELETED');
    expect(component.isDeleteConfirmOpen()).toBeFalse();
  });
});
