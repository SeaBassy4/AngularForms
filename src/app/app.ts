import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  registrationForm: FormGroup;
  successMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor(private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email], [this.emailAsyncValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      age: ['', [Validators.required, Validators.min(18)]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: this.matchPasswordValidator });
  }

  matchPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    // Only validate if both fields have values
    if (!password || !confirmPassword) return null;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Remove specific error
      const currentErrors = control.get('confirmPassword')?.errors;
      if (currentErrors) {
        const errors = { ...currentErrors };
        delete errors['passwordMismatch'];
        control.get('confirmPassword')?.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  }

  emailAsyncValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    const email = control.value;
    return of(email).pipe(
      delay(1500), 
      map(e => {
        if (e === 'test@test.com' || e === 'admin@banking.com') {
          return { emailTaken: true };
        }
        return null;
      })
    );
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      this.isLoading.set(true);
      this.successMessage.set('');
      
      setTimeout(() => {
        this.isLoading.set(false);
        this.successMessage.set('Registration successful! Welcome to SPG-Banking.');
        this.registrationForm.reset();
        
        setTimeout(() => this.successMessage.set(''), 5000);
      }, 2500);
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }
}
