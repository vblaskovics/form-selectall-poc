import { Component, DestroyRef, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, tap } from 'rxjs';

type CbFormValueType = Partial<{
  cbAll: boolean;
  cb1: boolean;
  cb2: boolean;
  cb3: boolean;
}>;

type CbFormGroupType = {
  cbAll: FormControl<boolean>;
  cb1: FormControl<boolean>;
  cb2: FormControl<boolean>;
  cb3: FormControl<boolean>;
};

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent {
  fb = inject(NonNullableFormBuilder);
  destroyRef = inject(DestroyRef);

  cbForm = this.fb.group<CbFormGroupType>({
    cbAll: this.fb.control(true),
    cb1: this.fb.control(false),
    cb2: this.fb.control(false),
    cb3: this.fb.control(false),
  });

  prevValue: CbFormValueType = this.cbForm.value;

  updateForm(newValue: CbFormValueType) {
    this.cbForm.patchValue(newValue, { emitEvent: false });
    this.prevValue = this.cbForm.value;
  }

  get isCheckAllClicked(): boolean {
    return !this.prevValue.cbAll && this.cbForm.value.cbAll === true;
  }

  get isCheckAllTrueAndOthersClicked(): boolean {
    const prevCbAll = this.prevValue.cbAll ?? false;
    const cb1 = this.cbForm.value.cb1 ?? false;
    const cb2 = this.cbForm.value.cb2 ?? false;
    const cb3 = this.cbForm.value.cb3 ?? false;
    return prevCbAll && (cb1 || cb2 || cb3) === true;
  }

  get isEveryCheckboxTrue(): boolean {
    const cb1 = this.cbForm.value.cb1 ?? false;
    const cb2 = this.cbForm.value.cb2 ?? false;
    const cb3 = this.cbForm.value.cb3 ?? false;
    return cb1 && cb2 && cb3;
  }

  checkAllClicked$ = this.cbForm.valueChanges.pipe(
    filter(() => this.isCheckAllClicked),
    tap(() => {
      this.updateForm({
        cb1: false,
        cb2: false,
        cb3: false,
      });
    }),
    takeUntilDestroyed(this.destroyRef)
  );

  checkAllTrueAndOthersClicked$ = this.cbForm.valueChanges.pipe(
    filter(() => this.isCheckAllTrueAndOthersClicked),
    tap(() => {
      this.updateForm({
        cbAll: false,
      });
    }),
    takeUntilDestroyed(this.destroyRef)
  );

  everyCheckboxTrue$ = this.cbForm.valueChanges.pipe(
    filter(() => this.isEveryCheckboxTrue),
    tap(() => {
      this.updateForm({
        cbAll: true,
        cb1: false,
        cb2: false,
        cb3: false,
      });
    }),
    takeUntilDestroyed(this.destroyRef)
  );

  ngOnInit() {
    this.checkAllClicked$.subscribe();

    this.checkAllTrueAndOthersClicked$.subscribe();

    this.everyCheckboxTrue$.subscribe();
  }
}
