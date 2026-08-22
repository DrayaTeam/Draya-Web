import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrayaPaginationComponent } from './pagination.component';

describe('DrayaPaginationComponent', () => {
  let component: DrayaPaginationComponent;
  let fixture: ComponentFixture<DrayaPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrayaPaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DrayaPaginationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('totalItems', 30);
    fixture.componentRef.setInput('pageSize', 6);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total pages correctly', () => {
    expect(component.totalPages()).toBe(5);
  });

  it('should emit pageChange when onSelectPage is called', () => {
    spyOn(component.pageChange, 'emit');
    component.onSelectPage(2);
    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });

  it('should emit next page on onNextPage', () => {
    spyOn(component.pageChange, 'emit');
    component.onNextPage();
    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });
});
