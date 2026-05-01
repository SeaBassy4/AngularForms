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
  registroForm: FormGroup;
  mensajeExito = signal<string>('');
  cargando = signal<boolean>(false);

  constructor(private fb: FormBuilder) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email], [this.emailAsyncValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      edad: ['', [Validators.required, Validators.min(18)]],
      terminos: [false, [Validators.requiredTrue]]
    }, { validators: this.matchPasswordValidator });
  }

  matchPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    // Solo validamos si ambos campos tienen valor o han sido tocados
    if (!password || !confirmPassword) return null;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Remover el error específico
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
        if (e === 'test@test.com' || e === 'admin@banco.com') {
          return { emailTaken: true };
        }
        return null;
      })
    );
  }

  onSubmit() {
    if (this.registroForm.valid) {
      this.cargando.set(true);
      this.mensajeExito.set('');
      
      setTimeout(() => {
        this.cargando.set(false);
        this.mensajeExito.set('¡Registro completado con éxito! Bienvenido al futuro bancario.');
        this.registroForm.reset();
        
        setTimeout(() => this.mensajeExito.set(''), 5000);
      }, 2500);
    } else {
      this.registroForm.markAllAsTouched();
    }
  }
}
