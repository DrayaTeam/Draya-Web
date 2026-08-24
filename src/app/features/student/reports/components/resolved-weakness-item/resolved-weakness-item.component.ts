import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StudentWeaknessItem } from '../../../../../core/models/student-weakness.model';

@Component({
  selector: 'app-resolved-weakness-item',
  standalone: true,
  imports: [],
  templateUrl: './resolved-weakness-item.component.html',
  styleUrl: './resolved-weakness-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResolvedWeaknessItemComponent {
  readonly weakness = input.required<StudentWeaknessItem>();

  readonly proficiencyPercent = computed(() => {
    const raw = this.weakness().proficiencyPercent;
    if (raw && raw > 10) return Math.min(100, Math.round(raw));
    if (raw && raw > 0 && raw <= 5) return Math.min(100, Math.round((raw / 5) * 100));
    if (raw && raw > 0 && raw <= 10) return Math.min(100, Math.round((raw / 10) * 100));
    // Default mastery score for mastered topics
    return 100;
  });

  readonly masteryMessage = computed(() => {
    const delta = this.weakness().delta;
    if (delta !== undefined && delta > 0) {
      return `تحسن مستمر بمقدار +${delta}% 📈`;
    }
    const pct = this.proficiencyPercent();
    if (pct >= 90) {
      return 'أداء ممتاز ومتقن بنجاح 🌟';
    }
    return 'تم تجاوز التحدي وتثبيت المفاهيم 🎯';
  });
}
