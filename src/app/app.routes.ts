import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './pages/auth/auth-layout.component';

export const routes: Routes = [

  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', loadComponent: () => import('./pages/auth/login.component').then((m) => m.LoginComponent) },
      { path: 'signup', loadComponent: () => import('./pages/auth/signup.component').then((m) => m.SignupComponent) },
    ],
  },

  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./pages/projects/projects.component').then((m) => m.ProjectsComponent),
      },
      {
        path: 'community',
        loadComponent: () =>
          import('./pages/community/community.component').then((m) => m.CommunityComponent),
      },
      {
        path: 'legal',
        loadComponent: () => import('./pages/legal/legal.component').then((m) => m.LegalComponent),
      },
      {
        path: 'investments',
        loadComponent: () =>
          import('./pages/investments/investments.component').then((m) => m.InvestmentsComponent),
      },
      {
        path: 'mentoring',
        loadComponent: () =>
          import('./pages/mentoring/mentoring.component').then((m) => m.MentoringComponent),
      },
      {
        path: 'roadmaps',
        loadComponent: () =>
          import('./pages/roadmaps/roadmaps.component').then((m) => m.RoadmapsComponent),
      },
      {
        path: 'partnerships',
        loadComponent: () =>
          import('./pages/partnerships/partnerships.component').then(
            (m) => m.PartnershipsComponent,
          ),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./pages/events/events.component').then((m) => m.EventsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
