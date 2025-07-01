import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Cuota } from '../../../models/cuota.model';
import { CuotaListComponent } from '../cuota-list/cuota-list.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-cuota',
  imports: [CommonModule, CuotaListComponent],
  templateUrl: './cuota.component.html',
  styleUrls: ['./cuota.component.scss']
})
export class CuotaComponent {
  constructor(private router: Router, private route: ActivatedRoute) {}

  onVerDetalle(cuota: Cuota) {
    this.router.navigate(['./cuota-form', cuota._id], { relativeTo: this.route });
  }

  onModificar(cuota: Cuota) {
    this.router.navigate(['./cuota-form', cuota._id], { relativeTo: this.route });
  }

  onNuevaCuota() {
    this.router.navigate(['./cuota-form', '0'], { relativeTo: this.route });
  }
}
