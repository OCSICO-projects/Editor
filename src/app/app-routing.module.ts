import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from '@app/auth/login/login.component';
import { EditorComponent } from '@app/editor/editor.component';
import { AuthGuard } from '@app/auth/auth.guard';

export const AppRoutes: Routes = [
  { path: '', redirectTo: 'editor', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'editor', component: EditorComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(AppRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
