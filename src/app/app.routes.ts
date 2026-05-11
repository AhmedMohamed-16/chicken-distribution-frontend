import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { PERMISSIONS } from './core/constants/Permissions.constant';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login/login').then(m => m.Login)
  },  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/unauthorized/unauthorized')
      .then(m => m.Unauthorized)
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
      }, {
        path: 'profile',
        loadComponent: () => import('./features/users/profile/profile')
          .then(m => m.Profile)
      },
      {
        path: 'master-data',
        children: [
      {
        path: 'profile',
        loadComponent: () => import('./features/users/profile/profile')
          .then(m => m.Profile)
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permissions: [PERMISSIONS.USERS.VIEW_USERS] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/users/userlist/userlist')
              .then(m => m.Userlist)
          },
          {
            path: 'create',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.USERS.MANAGE_USERS] },
            loadComponent: () => import('./features/users/userform/userform')
              .then(m => m.Userform)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/users/user-details/user-details')
              .then(m => m.UserDetails)
          },
          {
            path: ':id/edit',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.USERS.MANAGE_USERS] },
            loadComponent: () => import('./features/users/userform/userform')
              .then(m => m.Userform)
          },
          {
            path: ':id/permissions',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.USERS.MANAGE_USERS] },
            loadComponent: () => import('./features/users/manage-permissions/manage-permissions')
              .then(m => m.ManagePermissions)
          }
        ]
      },
          {
            path: 'partners',
            canActivate: [permissionGuard],
           data: { permissions: [PERMISSIONS.PARTNERS.VIEW_PARTNERS,PERMISSIONS.PARTNERS.MANAGE_PARTNERS],requireAll: false },
            loadComponent: () => import('./features/master-data/partners/partners/partners').then(m => m.Partners),

          },
          {
            path: 'farms',
            canActivate: [permissionGuard],
        data: { permissions: [PERMISSIONS.FARMS.VIEW_FARMS,PERMISSIONS.FARMS.MANAGE_FARMS],requireAll: false },
            loadComponent: () => import('./features/master-data/farms/farms/farms').then(m => m.Farms)
          },
          {
            path: 'buyers',
              canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.BUYERS.VIEW_BUYERS,PERMISSIONS.BUYERS.MANAGE_BUYERS],requireAll: false },

            loadComponent: () => import('./features/master-data/buyers/buyers/buyers').then(m => m.Buyers)
          },
          {
            path: 'vehicles',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.VEHICLES.VIEW_VEHICLES,PERMISSIONS.VEHICLES.MANAGE_VEHICLES],requireAll: false },
            loadComponent: () => import('./features/master-data/vehicles/vehicles/vehicles').then(m => m.Vehicles),

          },
          {
            path: 'cost-categories',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.COST_CATEGORIES.MANAGE_COST_CATEGORIES,PERMISSIONS.COST_CATEGORIES.VIEW_COST_CATEGORIES],requireAll: false },
            loadComponent: () => import('./features/master-data/cost-categories/cost-categories/cost-categories').then(m => m.CostCategories),
           },
          {
            path: 'chicken-types',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.CHICKEN_TYPES.MANAGE_CHICKEN_TYPES,PERMISSIONS.CHICKEN_TYPES.VIEW_CHICKEN_TYPES],requireAll: false },
            loadComponent: () => import('./features/master-data/chicken-types/chicken-types/chicken-types').then(m => m.ChickenTypes),
          },
          {
            path: 'employees',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.EMPLOYEES.VIEW_EMPLOYEES, PERMISSIONS.EMPLOYEES.MANAGE_EMPLOYEES], requireAll: false, title: 'الموظفون' },
            loadComponent: () => import('./features/master-data/employees/employees').then(m => m.Employees)
          },
          {
            path: 'safes',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.SYSTEM.APPLICATION_ADMIN], requireAll: true, title: 'الخزن' },
            loadComponent: () => import('./features/master-data/safes/safes').then(m => m.Safes)
          }

        ]
      },
      {
        path: 'operations',
        canActivate: [permissionGuard],
        data: { permissions: [PERMISSIONS.OPERATIONS.RECORD_FARM_LOADING,
              PERMISSIONS.OPERATIONS.RECORD_SALE,
              PERMISSIONS.OPERATIONS.RECORD_TRANSPORT_LOSS,
              PERMISSIONS.OPERATIONS.RECORD_COST,
              PERMISSIONS.OPERATIONS.CLOSE_OPERATION],requireAll: false  },
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
             canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.OPERATIONS.RECORD_FARM_LOADING] },
            loadComponent: () => import('./features/operations/farm-loading/farm-loading/farm-loading').then(m => m.FarmLoading)
          },
          {
            path: 'sales/:id',
             canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.OPERATIONS.RECORD_SALE] },
            loadComponent: () => import('./features/operations/sales/sales/sales').then(m => m.Sales)
          },
          {
            path: 'losses/:id',
             canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.OPERATIONS.RECORD_TRANSPORT_LOSS] },
            loadComponent: () => import('./features/operations/transport-losses/transport-losses/transport-losses').then(m => m.TransportLosses)
          },
          {
            path: 'costs/:id',
             canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.OPERATIONS.RECORD_COST] },
            loadComponent: () => import('./features/operations/daily-costs/daily-costs/daily-costs').then(m => m.DailyCosts)
          },
          {
            path: 'close-day/:id',
            //  canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.OPERATIONS.CLOSE_OPERATION] },
            loadComponent: () => import('./features/operations/close-day/close-day/close-day').then(m => m.CloseDay),
          }
        ]
      },
      {
        path: 'custodies',
        loadChildren: () =>
          import('./features/custodies/custodies.routes')
            .then(m => m.CUSTODY_ROUTES)
      },
      {
        path: 'finance',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'dashboard',
            data: { title: 'لوحة المالية' },
            loadComponent: () => import('./features/finance/finance-dashboard/finance-dashboard.component').then(m => m.FinanceDashboardComponent)
          },
          {
            path: 'advances',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.ADVANCES.VIEW_ADVANCES], title: 'السلف' },
            loadComponent: () => import('./features/finance/advances/advances.component').then(m => m.AdvancesComponent)
          },
          {
            path: 'custody',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.CUSTODY.VIEW_CUSTODY], title: 'العهدة' },
            children: [
              {
                path: '',
                loadComponent: () => import('./features/custodies/pages/custody-list/custody-list.component').then(m => m.CustodyListComponent)
              },
              {
                path: ':id',
                loadComponent: () => import('./features/custodies/pages/custody-statement/custody-statement.component').then(m => m.CustodyStatementComponent)
              }
            ]
          },
          {
            path: 'salaries',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.SYSTEM.APPLICATION_ADMIN], title: 'المرتبات' },
            loadComponent: () => import('./features/finance/salaries/salaries.component').then(m => m.SalariesComponent)
          },
          {
            path: 'partner-profits',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.SYSTEM.APPLICATION_ADMIN], title: 'أرباح الشركاء' },
            loadComponent: () => import('./features/finance/partner-profits/partner-profits.component').then(m => m.PartnerProfitsComponent)
          }
        ]
      },
      {
        path: 'reports',
        canActivate: [permissionGuard],
        data: {
          permissions: [
            PERMISSIONS.REPORTS.VIEW_DAILY_REPORT,
            PERMISSIONS.REPORTS.VIEW_PERIOD_REPORT,
            PERMISSIONS.REPORTS.VIEW_PROFIT_REPORT,
            PERMISSIONS.REPORTS.VIEW_DEBT_REPORT,
            PERMISSIONS.REPORTS.VIEW_STATEMENT_REPORT
          ],
          requireAll: false // User needs ANY of these permissions
        },

        children: [
          {
            path: '',
            redirectTo: 'daily',
            pathMatch: 'full'
          },
          {
            path: 'daily',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.REPORTS.VIEW_DAILY_REPORT] },
            loadComponent: () => import('./features/reports/daily-report/daily-report/daily-report').then(m => m.DailyReport)
          },
          {
            path: 'period',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.REPORTS.VIEW_PERIOD_REPORT] },
            loadComponent: () => import('./features/reports/period-report/period-report/period-report').then(m => m.PeriodReport)
          },
          {
            path: 'profits',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.REPORTS.VIEW_PROFIT_REPORT] },
            loadComponent: () => import('./features/reports/profit-report/profit-report/profit-report').then(m => m.ProfitReport)
          },
          {
            path: 'debts',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.REPORTS.VIEW_DEBT_REPORT] },

            loadComponent: () => import('./features/reports/debt-report/debt-report/debt-report').then(m => m.DebtReport)
          },
          {
            path: 'statement',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.REPORTS.VIEW_STATEMENT_REPORT], title: 'كشف الحساب العام' },
            loadComponent: () => import('./features/reports/statement-selector/statement-selector.component').then(m => m.StatementSelectorComponent)
          },
          {
            path: 'statement/:entityType/:entityId',
            canActivate: [permissionGuard],
            data: { permissions: [PERMISSIONS.REPORTS.VIEW_STATEMENT_REPORT], title: 'كشف الحساب' },
            loadComponent: () => import('./features/reports/statement-page/statement-page.component').then(m => m.StatementPageComponent)
          }
        ]
      },
  {
    path: 'backups',
     canActivate: [permissionGuard],
     data: { permissions: [PERMISSIONS.SYSTEM.APPLICATION_ADMIN] },
    loadComponent: () =>
      import('./features/backup/backup')
        .then(m => m.Backup)
  }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
