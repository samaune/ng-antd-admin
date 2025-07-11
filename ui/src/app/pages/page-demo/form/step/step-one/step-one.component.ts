import { Component, OnInit, ChangeDetectionStrategy, inject, input, output, InputSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { fnCheckForm } from '@utils/tools';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-step-one',
  templateUrl: './step-one.component.html',
  styleUrls: ['./step-one.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NzFormModule, ReactiveFormsModule, NzGridModule, NzSelectModule, NzButtonModule, NzInputModule, NzWaveModule, NzDividerModule, NzTypographyModule]
})
export class StepOneComponent implements OnInit {
  stepDirection: InputSignal<'horizontal' | 'vertical'> = input<'horizontal' | 'vertical'>('horizontal');
  validateForm!: FormGroup;
  readonly next = output<void>();

  private fb = inject(FormBuilder);

  // 下一步
  goNext(): void {
    if (!fnCheckForm(this.validateForm)) {
      return;
    }
    this.next.emit();
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      paymentAccount: [null, [Validators.required]],
      payWay: ['zhifubao'],
      payWayNo: [null, [Validators.required]],
      payeeName: [null, [Validators.required]],
      amount: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.initForm();
  }
}
