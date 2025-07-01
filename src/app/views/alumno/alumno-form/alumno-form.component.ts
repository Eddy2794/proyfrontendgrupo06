import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlumnoService } from '../../../services/alumno.service';
//import { PersonaService } from '../../../services/persona.service';
import { Alumno, AlumnoModel, ESTADOS_ALUMNO } from '../../../models/alumno.model';
import { Persona, PersonaModel } from '../../../models/persona.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-alumno-form',
  templateUrl: './alumno-form.component.html',
  styleUrls: ['./alumno-form.component.scss'],
  imports: [FormsModule, CommonModule]
})
export class AlumnoFormComponent implements OnInit {
  alumno: AlumnoModel = new AlumnoModel();
  personas: Persona[] = [];
  estados = ESTADOS_ALUMNO;
  isEdit = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alumnoService: AlumnoService,
    //private personaService: PersonaService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    // Cargar primero las personas, luego el alumno si es edición
   /* this.cargarPersonas().then(() => {
      if (id && id !== '0') {
        this.isEdit = true;
        this.loading = true;
        this.alumnoService.getAlumno(id).subscribe({
          next: (result) => {
            console.log('Datos del alumno recibidos:', result.data);
            console.log('persona_datos:', result.data.persona_datos);
            console.log('tutor_datos:', result.data.tutor_datos);
            
            this.alumno = AlumnoModel.fromJSON(result.data);
            
            // Setear los IDs correctamente después de que las personas estén cargadas
            // Usar setTimeout para asegurar que Angular detecte los cambios
            setTimeout(() => {
              if (result.data.persona_datos?._id) {
                this.alumno.persona = result.data.persona_datos._id.toString();
                console.log('ID de persona setado:', this.alumno.persona);
              } else if (result.data.persona) {
                this.alumno.persona = result.data.persona.toString();
                console.log('ID de persona setado (fallback):', this.alumno.persona);
              }
              
              if (result.data.tutor_datos?._id) {
                this.alumno.tutor = result.data.tutor_datos._id.toString();
                console.log('ID de tutor setado:', this.alumno.tutor);
              } else if (result.data.tutor) {
                this.alumno.tutor = result.data.tutor.toString();
                console.log('ID de tutor setado (fallback):', this.alumno.tutor);
              }
              
              console.log('Alumno final:', this.alumno);
            }, 100);
            
            this.loading = false;
          },
          error: (err) => {
            console.error('Error al cargar el alumno:', err);
            alert('Error al cargar el alumno');
            this.loading = false;
          }
        });
      } else {
        this.isEdit = false;
        this.alumno = new AlumnoModel();
      }
    });*/
  }

  /*async cargarPersonas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.personaService.getPersonas().subscribe({
        next: (result) => {
          console.log('Personas recibidas:', result.data);
          // Forzar conversión a array y proteger contra undefined/null
          if (Array.isArray(result.data)) {
            this.personas = result.data;
          } else if (result.data && Array.isArray(result.data.personas)) {
            this.personas = result.data.personas;
          } else if (result.data) {
            this.personas = Object.values(result.data);
          } else {
            this.personas = [];
          }
          resolve();
        },
        error: (err) => {
          alert('Error al cargar personas');
          reject(err);
        }
      });
    });
  }*/

  guardar() {
    if (this.isEdit) {
      this.alumnoService.updateAlumno(this.alumno).subscribe({
        next: () => {
          alert('Alumno actualizado correctamente');
          this.router.navigate(['/alumno']);
        },
        error: () => {
          alert('Error al actualizar el alumno');
        }
      });
    } else {
      this.alumnoService.addAlumno(this.alumno).subscribe({
        next: () => {
          alert('Alumno creado correctamente');
          this.router.navigate(['/alumno']);
        },
        error: () => {
          alert('Error al crear el alumno');
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/alumno']);
  }
} 