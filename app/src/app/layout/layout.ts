import { Component } from '@angular/core';
import { Header } from './header/header';
import { Sidebar } from './sidebar/sidebar';
import { Footer } from './footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
  imports: [Header, Sidebar, Footer, RouterOutlet],
})
export class Layout {}
