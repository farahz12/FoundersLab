import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgIconComponent } from '@ng-icons/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { App } from './app';
import { AppRoutingModule } from './app-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { AuthLayoutComponent } from './pages/auth/auth-layout.component';
import { LoginComponent } from './pages/auth/login.component';
import { SignupComponent } from './pages/auth/signup.component';
import { CommunityComponent } from './pages/community/community.component';
import { EventsComponent } from './pages/events/events.component';
import { HomeComponent } from './pages/home/home.component';
import { InvestmentsComponent } from './pages/investments/investments.component';
import { LandingLayoutComponent } from './pages/landing/landing-layout.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LegalComponent } from './pages/legal/legal.component';
import { MentoringComponent } from './pages/mentoring/mentoring.component';
import { PartnershipsComponent } from './pages/partnerships/partnerships.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { RoadmapsComponent } from './pages/roadmaps/roadmaps.component';
import { VerifyCertificateComponent } from './pages/verify-certificate/verify-certificate.component';
import { MapComponent } from './shared/components/map/map.component'; // Add this import
import { AdminRegistrationsComponent } from './pages/admin-registrations/admin-registrations.component';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

@NgModule({
  declarations: [
    App,
    LayoutComponent,
    AuthLayoutComponent,
    LoginComponent,
    SignupComponent,
    CommunityComponent,
    EventsComponent,
    HomeComponent,
    InvestmentsComponent,
    LandingLayoutComponent,
    LandingComponent,
    LegalComponent,
    MentoringComponent,
    PartnershipsComponent,
    ProfileComponent,
    ProjectsComponent,
    RoadmapsComponent,
    VerifyCertificateComponent,
    MapComponent, // Add MapComponent here
    AdminRegistrationsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgIconComponent,
    ...HlmBadgeImports,
    ...HlmProgressImports,
  ],
  providers: [provideHttpClient(withInterceptors([jwtInterceptor]))],
  bootstrap: [App],
})
export class AppModule {}