import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { ApiService, CreateUserRequest } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUsername = '';
  currentRole = '';
  changingPassword = false;
  creatingUser = false;
  private authSubscription?: Subscription;

  readonly passwordForm;
  readonly createUserForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly toast: ToastService
  ) {
    this.passwordForm = this.formBuilder.nonNullable.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });

    this.createUserForm = this.formBuilder.nonNullable.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['HR_Manager', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.getCurrentUser().subscribe((user) => {
      this.currentUsername = user?.username ?? '';
      this.currentRole = user?.role ?? '';
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  get isAdmin(): boolean {
    return this.currentRole === 'Admin';
  }

  submitPasswordChange(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.toast.error('New password and confirm password do not match.', 3000);
      return;
    }

    this.changingPassword = true;
    this.apiService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.changingPassword = false;
        this.passwordForm.reset();
        this.toast.success('Password changed successfully.', 3000);
      },
      error: (error) => {
        this.changingPassword = false;
        const message = error?.error?.message || 'Failed to change password.';
        this.toast.error(message, 3500);
      }
    });
  }

  createUser(): void {
    if (this.createUserForm.invalid) {
      this.createUserForm.markAllAsTouched();
      return;
    }

    const payload: CreateUserRequest = this.createUserForm.getRawValue();
    this.creatingUser = true;
    this.apiService.createUser(payload).subscribe({
      next: (created) => {
        this.creatingUser = false;
        this.createUserForm.reset({ username: '', password: '', role: 'HR_Manager' });
        this.toast.success(`User ${created.username} created with ${created.role} access.`, 3500);
      },
      error: (error) => {
        this.creatingUser = false;
        const message = error?.error?.message || 'Failed to create user.';
        this.toast.error(message, 3500);
      }
    });
  }
}
