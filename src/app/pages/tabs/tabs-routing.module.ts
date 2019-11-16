import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [{
  path: 'tabs',
  component: TabsPage,
  children: [{
    path: 'vote',
    children: [{
      path: '',
      loadChildren: () =>
        import('../home/home.module').then(m => m.HomePageModule)
    }]
  }, {
    path: 'rate',
    children: [{
      path: '',
      loadChildren: () =>
        import('../rate/rate.module').then(m => m.RatePageModule)
    }]
  }, {
    path: '',
    redirectTo: '/tabs/vote',
    pathMatch: 'full'
  }]
}, {
  path: '',
  redirectTo: '/tabs/vote',
  pathMatch: 'full'
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
