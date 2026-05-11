import { Routes } from '@angular/router';
import { CustodyListComponent } from './pages/custody-list/custody-list.component';
import { CustodyStatementComponent } from './pages/custody-statement/custody-statement.component';

export const CUSTODY_ROUTES: Routes = [
  {
    path: '',
    component: CustodyListComponent
  },
  {
    path: ':id',
    component: CustodyStatementComponent
  }
];
