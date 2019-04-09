import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '@app/auth/auth.service';
import { MessageService } from '@app/shared/services/message.service';
import { JwtService } from '../jwt.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translateService: TranslateService,
    private messageService: MessageService,
    private jwtService: JwtService
  ) {
    this.initForm();
  }

  public initForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  public onSubmit() {
    const user = this.form.value;

    this.authService.signIn(user)
      .subscribe(
        data => {
          this.jwtService.setToken(data.token);

          this.router.navigate(['/editor']);
        },
        err => {
          this.messageService.showErrorMessage(`Incorrect login or password`);
        }
      );
  }
}
