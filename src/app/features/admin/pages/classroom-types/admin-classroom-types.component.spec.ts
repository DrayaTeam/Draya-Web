import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminClassroomTypesComponent } from './admin-classroom-types.component';
import { AdminClassroomTypeService } from '../../services/admin-classroom-type.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ClassroomTypeDto } from '../../models/admin-classroom-type.model';

describe('AdminClassroomTypesComponent', () => {
  let component: AdminClassroomTypesComponent;
  let fixture: ComponentFixture<AdminClassroomTypesComponent>;
  let serviceSpy: jasmine.SpyObj<AdminClassroomTypeService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const mockTypes: ClassroomTypeDto[] = [
    {
      id: 'ct-1',
      name: 'مجموعة سنتر (حضوري)',
      description: 'فصل دراسي داخل مقر سنتر',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'ct-2',
      name: 'أونلاين تفاعلي',
      description: 'بث مباشر تفاعلي',
      isActive: false,
      createdAt: '2026-01-02T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('AdminClassroomTypeService', [
      'getAll',
      'create',
      'update',
      'deactivate',
    ]);
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    serviceSpy.getAll.and.returnValue(of(mockTypes));
    serviceSpy.create.and.returnValue(of({ ...mockTypes[0], id: 'ct-3' }));
    serviceSpy.update.and.returnValue(of(void 0));
    serviceSpy.deactivate.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [AdminClassroomTypesComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: AdminClassroomTypeService, useValue: serviceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminClassroomTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the admin classroom types component', () => {
    expect(component).toBeTruthy();
  });

  it('should load classroom types on initialization', () => {
    expect(serviceSpy.getAll).toHaveBeenCalled();
    expect(component.classroomTypes().length).toBe(2);
    expect(component.filteredTypes().length).toBe(2);
  });

  it('should filter items by search query', () => {
    component.onSearch('سنتر');
    expect(component.filteredTypes().length).toBe(1);
    expect(component.filteredTypes()[0].name).toContain('سنتر');
  });

  it('should open create modal with empty form', () => {
    component.openCreateModal();
    expect(component.isModalOpen()).toBeTrue();
    expect(component.isEditMode()).toBeFalse();
    expect(component.form.get('name')?.value).toBe('');
  });

  it('should open edit modal populated with item values', () => {
    component.openEditModal(mockTypes[0]);
    expect(component.isModalOpen()).toBeTrue();
    expect(component.isEditMode()).toBeTrue();
    expect(component.form.get('name')?.value).toBe('مجموعة سنتر (حضوري)');
  });

  it('should create a new classroom type successfully', () => {
    component.openCreateModal();
    component.form.patchValue({
      name: 'مراجعة نهائية مكثفة',
      description: 'كورس مراجعة مكثف',
      isActive: true,
    });

    component.saveType();
    expect(serviceSpy.create).toHaveBeenCalledWith({
      name: 'مراجعة نهائية مكثفة',
      description: 'كورس مراجعة مكثف',
    });
    expect(toastSpy.success).toHaveBeenCalledWith('ADMIN.CLASSROOM_TYPES.SUCCESS_CREATED');
    expect(component.isModalOpen()).toBeFalse();
  });

  it('should update an existing classroom type successfully', () => {
    component.openEditModal(mockTypes[0]);
    component.form.patchValue({
      name: 'مجموعة سنتر معدلة',
      description: 'وصف معدل',
      isActive: true,
    });

    component.saveType();
    expect(serviceSpy.update).toHaveBeenCalledWith('ct-1', {
      name: 'مجموعة سنتر معدلة',
      description: 'وصف معدل',
      isActive: true,
    });
    expect(toastSpy.success).toHaveBeenCalledWith('ADMIN.CLASSROOM_TYPES.SUCCESS_UPDATED');
    expect(component.isModalOpen()).toBeFalse();
  });

  it('should handle delete confirmation successfully', () => {
    component.promptDelete(mockTypes[0]);
    expect(component.isDeleteConfirmOpen()).toBeTrue();
    expect(component.itemToDelete()).toBe(mockTypes[0]);

    component.onConfirmDelete();
    expect(serviceSpy.deactivate).toHaveBeenCalledWith('ct-1');
    expect(toastSpy.success).toHaveBeenCalledWith('ADMIN.CLASSROOM_TYPES.SUCCESS_DELETED');
    expect(component.isDeleteConfirmOpen()).toBeFalse();
  });
});
