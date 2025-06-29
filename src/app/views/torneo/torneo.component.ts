import { Component } from '@angular/core';
import { TorneoService } from '../../services/torneo.service';
import { Torneo } from '../../models/torneo';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-torneo',
  imports: [FormsModule, CommonModule],
  templateUrl: './torneo.component.html',
  styleUrl: './torneo.component.scss'
})
export class TorneoComponent {
  torneos: Torneo[] = [];

  constructor(private torneoService: TorneoService, private router: Router) {
    this.getTorneos();
  }


  getTorneos() {
    this.torneoService.getTorneos().subscribe({
      next: (result) => {
        this.torneos = result.data;
      },
      error: (err) => {
        console.error('Error al cargar torneos:', err);
      }
    });
  }
  agregar() {
    this.router.navigate(['torneo-form', '0']);
  }
  modificar(torneo: Torneo) {
    this.router.navigate(['torneo-form', torneo._id]);
  }
  eliminarTorneo(id: string) {
    if (confirm('¿Estás seguro de que querés eliminar este torneo?')) {
      this.torneoService.deleteTorneo(id).subscribe({
        next: result => {
          if (result.success == true) {
            alert("El torneo se eliminó correctamente");
            this.getTorneos();
          }
        },
        error: error => {
          alert("Ocurrio un error al eliminar");
          console.log(error);
        }
      })
    }
  }
}
