import { Routes } from '@angular/router';
import { EnrollmentFormComponent } from './enrollment-form/enrollment-form.component';

export const routes: Routes = [
  { path: '', component: EnrollmentFormComponent },
  { path: 'register', component: EnrollmentFormComponent },
  { path: '**', redirectTo: '' }
];
