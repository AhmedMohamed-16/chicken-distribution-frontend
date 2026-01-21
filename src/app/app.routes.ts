import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login/login').then(m => m.Login)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'master-data',
        children: [
          {
            path: 'partners',
            loadComponent: () => import('./features/master-data/partners/partners/partners').then(m => m.Partners),
            canActivate: [adminGuard]
          },
          {
            path: 'farms',
            loadComponent: () => import('./features/master-data/farms/farms/farms').then(m => m.Farms)
          },
          {
            path: 'buyers',
            loadComponent: () => import('./features/master-data/buyers/buyers/buyers').then(m => m.Buyers)
          },
          {
            path: 'vehicles',
            loadComponent: () => import('./features/master-data/vehicles/vehicles/vehicles').then(m => m.Vehicles),
            canActivate: [adminGuard]
          },
          {
            path: 'cost-categories',
            loadComponent: () => import('./features/master-data/cost-categories/cost-categories/cost-categories').then(m => m.CostCategories),
            canActivate: [adminGuard]
          },
          {
            path: 'chicken-types',
            loadComponent: () => import('./features/master-data/chicken-types/chicken-types/chicken-types').then(m => m.ChickenTypes),
            canActivate: [adminGuard]
          }

        ]
      },
      {
        path: 'operations',
        children: [
          {
            path: 'start-day',
            loadComponent: () => import('./features/operations/start-day/start-day/start-day').then(m => m.StartDay)
          },
          {
            path: 'daily/:id',
            loadComponent: () => import('./features/operations/daily-operation/daily-operation/daily-operation').then(m => m.DailyOperation)
          },
          {
            path: 'farm-loading/:id',
            loadComponent: () => import('./features/operations/farm-loading/farm-loading/farm-loading').then(m => m.FarmLoading)
          },
          {
            path: 'sales/:id',
            loadComponent: () => import('./features/operations/sales/sales/sales').then(m => m.Sales)
          },
          {
            path: 'losses/:id',
            loadComponent: () => import('./features/operations/transport-losses/transport-losses/transport-losses').then(m => m.TransportLosses)
          },
          {
            path: 'costs/:id',
            loadComponent: () => import('./features/operations/daily-costs/daily-costs/daily-costs').then(m => m.DailyCosts)
          },
          {
            path: 'close-day/:id',
            loadComponent: () => import('./features/operations/close-day/close-day/close-day').then(m => m.CloseDay),
            canActivate: [adminGuard]
          }
        ]
      },
      {
        path: 'reports',
        canActivate: [adminGuard],
        children: [
          {
            path: 'daily',
            loadComponent: () => import('./features/reports/daily-report/daily-report/daily-report').then(m => m.DailyReport)
          },
          {
            path: 'period',
            loadComponent: () => import('./features/reports/period-report/period-report/period-report').then(m => m.PeriodReport)
          },
          {
            path: 'profits',
            loadComponent: () => import('./features/reports/profit-report/profit-report/profit-report').then(m => m.ProfitReport)
          },
          {
            path: 'debts',
            loadComponent: () => import('./features/reports/debt-report/debt-report/debt-report').then(m => m.DebtReport)
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
