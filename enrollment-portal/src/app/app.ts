import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatIconModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>local_hospital</mat-icon>
      <span class="title">HealthFlow Registry</span>
      <span class="spacer"></span>
      <a mat-button href="https://registry.healthflow.tech" target="_blank">
        <mat-icon>search</mat-icon>
        Search Registry
      </a>
    </mat-toolbar>
    
    <main>
      <router-outlet></router-outlet>
    </main>
    
    <footer>
      <p>&copy; 2026 HealthFlow Medical HCX. All rights reserved.</p>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    mat-toolbar {
      mat-icon {
        margin-right: 0.5rem;
      }
      
      .title {
        font-weight: 500;
      }
      
      .spacer {
        flex: 1;
      }
    }
    
    main {
      flex: 1;
      background: #fafafa;
      padding: 1rem 0;
    }
    
    footer {
      background: #333;
      color: #fff;
      text-align: center;
      padding: 1rem;
      
      p {
        margin: 0;
        font-size: 0.875rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'HealthFlow Enrollment Portal';
}
