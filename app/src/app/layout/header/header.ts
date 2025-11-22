import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, MatButtonModule, MatToolbar],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}
