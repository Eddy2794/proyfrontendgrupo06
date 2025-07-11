import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { TorneoFormComponent } from './views/torneo-form/torneo-form.component';
import { CategoriaFormComponent } from './views/categoria-form/categoria-form.component';
import { TorneoCategoriaFormComponent} from './views/torneo-categoria-form/torneo-categoria-form.component'
import { hasRoleGuard } from './guards/has-role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () => import('./layout').then(m => m.DefaultLayoutComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      },
      {
        path: 'theme',
        loadChildren: () => import('./views/theme/routes').then((m) => m.routes)
      },
      {
        path: 'base',
        loadChildren: () => import('./views/base/routes').then((m) => m.routes)
      },
      {
        path: 'buttons',
        loadChildren: () => import('./views/buttons/routes').then((m) => m.routes)
      },
      {
        path: 'forms',
        loadChildren: () => import('./views/forms/routes').then((m) => m.routes)
      },
      {
        path: 'icons',
        loadChildren: () => import('./views/icons/routes').then((m) => m.routes)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./views/notifications/routes').then((m) => m.routes)
      },
      {
        path: 'widgets',
        loadChildren: () => import('./views/widgets/routes').then((m) => m.routes)
      },
      {
        path: 'pagos',
        loadChildren: () => import('./views/pagos/routes').then((m) => m.routes)
      },
      {
        path: 'perfil',
        loadChildren: () => import('./views/perfil/routes').then((m) => m.routes)
      },
      {
        path: 'charts',
        loadChildren: () => import('./views/charts/routes').then((m) => m.routes)
      },
      {
        path: 'pages',
        loadChildren: () => import('./views/pages/routes').then((m) => m.routes)
      },
      {
        path: 'profesor',
        loadChildren: () => import('./views/profesor/routes').then((m) => m.routes)
      },
      {
        path: 'profesor-categoria',
        loadChildren: () => import('./views/profesor-categoria/routes').then((m) => m.routes)
      },
      {
        path: 'torneos',
        loadChildren: () => import('./views/torneo/routes').then((m) => m.routes)
      },
      {
        path: 'user',
        loadChildren: () => import('./views/user/routes').then((m) => m.routes)
      },
      {
        path: 'torneo-form/:id',
        component: TorneoFormComponent,
        canActivate: [hasRoleGuard],
        data: {
          title: 'Nuevo torneo',
          roles: ['ADMIN', 'MODERATOR']
        }
      },
      {
        path: 'alumno',
        loadChildren: () => import('./views/alumno/routes').then((m) => m.routes)
      },
      {
        path: 'alumno-categoria',
        loadChildren: () => import('./views/alumno_categoria/routes').then((m) => m.routes)
      },
      {
        path: 'cuota',
        loadChildren: () => import('./views/cuota/routes').then((m) => m.routes)
      },
      {
        path: 'categorias',
        loadChildren: () => import('./views/categoria/routes').then((m) => m.routes)
      },
      {
        path: 'categoria-form/:id',
        component: CategoriaFormComponent,
        canActivate: [hasRoleGuard],
        data: {
          title: 'Gestión de Categoría',
          roles: ['ADMIN', 'MODERATOR']
        }
      },
      {
        path: 'torneos-categorias',
        loadChildren: () => import('./views/torneo-categoria/routes').then((m) => m.routes)
      },
      {
        path: 'torneo-categoria-form/:id',
        component: TorneoCategoriaFormComponent,
        canActivate: [hasRoleGuard],
        data: {
          title: 'Nuevo torneo',
          roles: ['ADMIN', 'MODERATOR']
        }
      }

    ]
  },
  {
    path: '404',
    loadComponent: () => import('./views/pages/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./views/pages/page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./views/pages/register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Register Page'
    }
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./views/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    data: {
      title: 'Recuperar Contraseña'
    }
  },
  { path: '**', redirectTo: 'dashboard' }
];
