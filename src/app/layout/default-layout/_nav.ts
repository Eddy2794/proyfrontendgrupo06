import { INavData as CoreUINavData } from '@coreui/angular';

export interface INavData extends Omit<CoreUINavData, 'children'> {
  roles?: string[];
  children?: INavData[];
}

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' }
  },
  {
    name: 'Mi Perfil',
    url: '/perfil',
    iconComponent: { name: 'cil-user' }
  },
  {
    title: true,
    name: 'Gestión Académica'
  },
  {
    name: 'Alumnos',
    iconComponent: { name: 'cil-people' },
    children: [
      {
        name: 'Lista de Alumnos',
        url: '/alumno',
        iconComponent: { name: 'cil-user' }
      },
      {
        name: 'Alumno-Categoría',
        url: '/alumno-categoria',
        iconComponent: { name: 'cil-list' }
      },
      {
        name: 'Cuotas',
        url: '/cuota',
        roles: ['ADMIN'],
        iconComponent: { name: 'cil-dollar' }
      }
    ]
  },
  {
    name: 'Profesores',
    iconComponent: { name: 'cil-people' },
    children: [
      {
        name: 'Lista de Profesores',
        url: '/profesor/lista',
        iconComponent: { name: 'cil-user-follow' }
      },
      {
        name: 'Profesores y Categorias',
        url: '/profesor-categoria/lista',
        iconComponent: { name: 'cil-user-follow' }
      },
    ]
  },
  {
    name: 'Categorías',
    url: '/categorias',
    iconComponent: { name: 'cil-tags' }
  },
  {
    title: true,
    name: 'Competencias'
  },
  {
    name: 'Torneos',
    url: '/torneos',
    iconComponent: { name: 'cil-list' }
  },
  {
    name: 'Torneos Categorías',
    url: '/torneos-categorias',
    iconComponent: { name: 'cil-list' }
  },
  {
    title: true,
    name: 'Finanzas',
    roles: ['ADMIN', 'TUTOR'],
  },
  {
    name: 'Pagos',
    url: '/pagos',
    iconComponent: { name: 'cil-credit-card' },
    roles: ['ADMIN', 'TUTOR'],
    children: [
      {
        name: 'Realizar Pago',
        url: '/pagos/realizar-pago',
        iconComponent: { name: 'cil-plus' }
      },
      {
        name: 'Historial',
        url: '/pagos/historial',
        iconComponent: { name: 'cil-history' }
      }
    ]
  },
  {
    title: true,
    name: 'Administración',
    roles: ['ADMIN'],
  },
  {
    name: 'Gestión de Usuarios',
    url: '/user',
    iconComponent: { name: 'cil-settings' },
    roles: ['ADMIN'],
    children: [
      {
        name: 'Lista de Usuarios',
        url: '/user/list',
        iconComponent: { name: 'cil-list' }
      },
      {
        name: 'Crear Usuario',
        url: '/user/form',
        iconComponent: { name: 'cil-user-plus' }
      }
    ]
  },
];