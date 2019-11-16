import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  { path: 'book-details', loadChildren: './pages/book-details/book-details.module#BookDetailsPageModule' },
  { path: 'details/:id', loadChildren: './pages/book-details/book-details.module#BookDetailsPageModule' },
  { path: 'book-details/:id', loadChildren: './pages/book-details/book-details.module#BookDetailsPageModule' },
  { 
    path: '', 
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
