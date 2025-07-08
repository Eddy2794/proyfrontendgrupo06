import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Cuota } from '../../../models/cuota.model';
import { CuotaListComponent } from '../cuota-list/cuota-list.component';
import { CommonModule } from '@angular/common';
import { CuotaDetalleModalComponent } from '../cuota-detalle-modal.component';
import { CuotaService } from '../../../services/cuota.service';

@Component({
  standalone: true,
  selector: 'app-cuota',
  imports: [CommonModule, CuotaListComponent, CuotaDetalleModalComponent],
  templateUrl: './cuota.component.html',
  styleUrls: ['./cuota.component.scss']
})
export class CuotaComponent {
  cuotaDetalleVisible = false;
  cuotaSeleccionada: Cuota | null = null;

  @ViewChild(CuotaListComponent) cuotaListComponent!: CuotaListComponent;

  constructor(private router: Router, private route: ActivatedRoute, private cuotaService: CuotaService) {}

  onVerDetalle(cuota: Cuota) {
    this.cuotaSeleccionada = cuota;
    this.cuotaDetalleVisible = true;
  }

  cerrarDetalle() {
    this.cuotaDetalleVisible = false;
    this.cuotaSeleccionada = null;
  }

  onModificar(cuota: Cuota) {
    this.router.navigate(['./cuota-form', cuota._id], { relativeTo: this.route });
  }

  onNuevaCuota() {
    this.router.navigate(['./cuota-form', '0'], { relativeTo: this.route });
  }

  onPagoEfectivo(cuota: Cuota) {
    const id = cuota._id?.toString();
    if (!id) {
      alert('ID de cuota no válido');
      return;
    }
    if (confirm('¿Confirmás marcar esta cuota como pagada en efectivo?')) {
      this.cuotaService.marcarComoPagada(id, {
        fecha_pago: new Date(),
        metodo_pago: 'EFECTIVO'
      }).subscribe({
        next: () => {
          alert('¡Cuota marcada como pagada!');
          // Refrescar la lista de cuotas
          this.cuotaListComponent.cargarDatos();
        },
        error: () => {
          alert('Ocurrió un error al marcar como pagada');
        }
      });
    }
  }
}
