import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../features/auth/services/auth.service';
import { UserNameClaim } from '../../../core/models/token-claim.interface';
import { CartService } from '../../../features/cotizador/services/cart/cart.service';

import { Menubar } from 'primeng/menubar';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { catchError, EMPTY, map, of } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { Popover, PopoverModule } from 'primeng/popover';
import { CommonModule } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';
import { Menu, MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CotizacionService } from '../../../features/cotizador/services/cotizacion/cotizacion.service';

interface NavBarOptions {
  title: string,
  isTagActive: boolean,     
  tagLabel: string,
  severity: number,
  showOptionsMenu: boolean
}

interface BtnDisable {
  saveBtn: boolean,
  deleteBtn: boolean,
  printBtn: boolean,
}

@Component({
  selector: 'shared-navbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Menubar,
    DrawerModule,
    ButtonModule,
    RouterModule,
    Toast,
    TagModule,
    PopoverModule,
    Tooltip,
    MenuModule,
    ToggleButtonModule
  ],
  providers: [ MessageService],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  @ViewChild('op') op!: Popover;
  @ViewChild('menu') menu!: Menu;

  @Input()
  title: NavBarOptions = {
    title: '',
    isTagActive: false,     
    tagLabel: '',
    severity: -1,
    showOptionsMenu: false
  };

  @Input()
  btnDisable: BtnDisable = {
    saveBtn: true,
    deleteBtn: true,
    printBtn: true,
  }

  @Output()
  onSave: EventEmitter<void> = new EventEmitter();

  @Output()
  onDelete: EventEmitter<any> = new EventEmitter();

  @Output()
  onPrint: EventEmitter<void> = new EventEmitter();


  visible: boolean = false;
  userNameClaim: UserNameClaim = {} as UserNameClaim;

  constructor( 
    private messageServ: MessageService, 
    private _authService: AuthService, 
    private _cartService: CartService,
    private _cotizacionService: CotizacionService,
    private _router: Router 
  ) {}

  items: MenuItem[] | undefined;

  isRoundedActive: boolean = false;


  ngOnInit(): void {
    this.getUserClaim();

    // configuración de redondeo (por ahora desactivadado)
    // this.getRoundedPriceConfig();

    this.items = [
      {
          label: 'Opciones',
          items: [
              {
                  label: 'Guardar',
                  icon: 'pi pi-save',
                  disabled: this.btnDisable.saveBtn,
                  command: () => {
                      this.onSaveClick();
                  }
              },
              {
                  label: 'Eliminar',
                  icon: 'pi pi-trash',
                  disabled: this.btnDisable.deleteBtn,
                  command: () => {
                      this.onDeleteClick();
                  }
              },
              {
                  label: 'Imprimir',
                  icon: 'pi pi-print',
                  // disabled: this.btnDisable.printBtn,
                  // disabled: true,
                  disabled: false,
                  command: () => {
                      this.onPrintClick();
                  }
              },
          ]
      }
  ];
  }

  onSaveClick() {
    // this.op.toggle(event);
    this.onSave.emit();
  }

  onDeleteClick() {
    // this.op.toggle(event);
    this.onDelete.emit(event);
  }

  onPrintClick() {
    // this.op.toggle(event);
    this.onPrint.emit();
  }

  getUserClaim() {
    this._authService.getClaimsUsername().subscribe( claim => {
      if(claim.value  === undefined) {
        this.userNameClaim.type = '';
        this.userNameClaim.value = '';
        return;
      }
      this.userNameClaim = claim;
    })
  }

  getUserName() {
    if(this.userNameClaim.value === undefined) {
      return '';
    }
    return this.userNameClaim.value;
  }

  getStatusSeverity(status: number ) {
    switch(status) {
      case 0:
        return 'warn';
      case 1:
        return 'info';      
      default: 
        return 'secondary';
    }
  }

  logout() {
    this.visible = false;
    this._authService.logout()
    .pipe(      
      catchError((err) => {
        console.error('Error al cerrar sesión:', err);
        this._router.navigateByUrl('/'); // Si hay error, redirige inmediatamente
        return EMPTY;
      })
    )  
    .subscribe( response => {
      
      this.messageServ.add({
        severity: 'info',
        summary: 'Sesión cerrada.',
        detail: `Sesión cerrada correctamente`,
        key: 'toast-navbar',
        life: 2500
      });
              
      setTimeout(()=> {
        this._router.navigateByUrl('/');
      }, 1500)

    } );
    
  }

  toggle(event: any) {
    this.op.toggle(event);
  }

  menuToggle() {
    this.items = []

    this.setMenuItems();
  }


  setMenuItems() {
    this.items = [
      {
          label: 'Opciones',
          items: [
              {
                  label: 'Guardar',
                  icon: 'pi pi-save',
                  disabled: this.btnDisable.saveBtn,
                  command: () => {
                      this.onSaveClick();
                  }
              },
              {
                  label: 'Eliminar',
                  icon: 'pi pi-trash',
                  disabled: this.btnDisable.deleteBtn,
                  command: () => {
                      this.onDeleteClick();
                  }
              },
              // {
              //     label: 'Imprimir',
              //     icon: 'pi pi-print',
              //     disabled: this.btnDisable.printBtn,
              //     command: () => {
              //         this.onPrintClick();
              //     }
              // },
          ]
        }
    ];
  }

  // configuración de redondeo (por ahora desactivadado)
  // getRoundedPriceConfig() {
  //   this.isRoundedActive = this._cartService.getRoundedPriceConfig()
  // }

  // setRoundedPriceConfig() {
  //   this._cartService.setRoundedPriceConfig(this.isRoundedActive);

  //   this._cotizacionService.roundProductsPriceInQuotations(this.isRoundedActive);
    
  // }

}
