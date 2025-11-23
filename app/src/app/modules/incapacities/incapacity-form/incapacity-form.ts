import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-incapacity-form',
  imports: [],
  templateUrl: './incapacity-form.html',
  styleUrl: './incapacity-form.scss',
})
export class IncapacityForm implements OnInit {
  incapacityId?: number;

  constructor() {}

  ngOnInit() {
    // Acceder a la historia y al estado de navegación
    this.incapacityId = history.state.incapacityId;
    console.log('Incapacity ID from navigation state:', this.incapacityId);

  }
}
