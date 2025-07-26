import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ReqLogin } from '../../../../core/models/req-login.interface';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { catchError, EMPTY } from 'rxjs';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    Toast,
    InputTextModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  user: ReqLogin = {
    username: '',
    password: '',
  }
  loginLoading = false;

  constructor(private messageServ: MessageService, private _authServ: AuthService, private _router: Router) { }

  validateForm() {
    this.user.username = this.user.username.trim();
    this.user.password = this.user.password.trim();

    if (this.user.username.length === 0 || this.user.password.length === 0) {
      this.messageServ.add({
        severity: 'error',
        summary: 'Campos vacíos.',
        detail: 'Por favor, ingrese sus credenciales.',
        key: 'toast-login',
        life: 2500
      });
      return false;
    }
    return true;
  }

  login() {
    if (!this.validateForm()) return;

    this.loginLoading = true;
    this._authServ.login(this.user).pipe(
      catchError((err) => {
        if (err.status === 401) {
          this.messageServ.add({
            severity: 'error',
            summary: 'Credenciales incorrectas.',
            detail: 'El usuario y/o la contraseña son incorrectos.',
            key: 'toast-login',
            life: 2500
          });

          this.user = {
            username: '',
            password: '',
          }
        } else {
          this.messageServ.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Se produjo un error al intentar iniciar sesión.',
            key: 'toast-login',
            life: 2500
          });

          this.user = {
            username: '',
            password: '',
          }
        }
        console.error(err);
        this.loginLoading = false;
        return EMPTY;
      })
    ).subscribe(response => {
      if (response.status === 200) {
        this.messageServ.add({
          severity: 'success',
          summary: 'Inicio de sesión exitoso.',
          detail: `${response.body}`,
          key: 'toast-login',
          life: 5000
        });

        setTimeout(() => {
          this._router.navigate(['/cotizador']);
          this.loginLoading = false;
        }, 1500)
      }
    }
    );

    // this.messageServ.add({
    //   severity: 'success',
    //   summary: 'Inicio de sesión exitoso.',
    //   detail: `LOGIN NO VALIDADO, GUARDS DESACTIVADOS EN ROUTER`,
    //   key: 'toast-login',
    //   life: 5000
    // });

    // setTimeout(() => {
    //   this._router.navigate(['/cotizador']);
    //   this.loginLoading = false;
    // }, 1500)
  }

}
