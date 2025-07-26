import { Injectable } from '@angular/core';
import { Quotation } from '../../models/cotizacion.interface';

@Injectable({
    providedIn: 'root'
})
export class MigrationService {

    constructor() { }

    migrateQuotation() {
        const storage = localStorage.getItem('backup-data-local');
        if (storage) {
             // backup
            localStorage.setItem('backup-migration-v1', JSON.stringify({
                date: new Date(),
                data:JSON.parse(storage)
            }));

            try {
                const parsedQuotation = JSON.parse(storage);

                const migratedQuotation: Quotation[] = parsedQuotation.map((sale: any) => {
                    // Si tiene la estructura de cambio1 o cambio2
                    if (sale.detail) {
                        console.log('migracion necesaria', sale.no );
                        
                        return {
                            no: sale.no,
                            noClient: sale.noClient || '',
                            clientName: sale.clientName || '',
                            status: sale.status,
                            cart: sale.detail.map((item: any) => ({
                                noLine: item.noLine || 0,
                                productCode: item.noProduct,
                                quantity: item.quantity,
                                price: item.price,
                                descProduct: item.descProduct,
                                amount: item.amount,
                                originalPrice: item.price // Copiar valor de price a originalPrice
                            })),
                            totalPrice: sale.total || sale.totalPrice,
                            timestamp: sale.timestamp,
                            minorPriceChecked: false, // Valor por defecto
                            fecha: new Date(sale.timestamp) 
                        };
                    }

                    // Si ya está en el formato actualizado, devolver tal cual
                    return sale;
                });

                // Guarda los datos migrados en localStorage
                localStorage.setItem('backup-data-local', JSON.stringify(migratedQuotation));
                // console.log('Migración completada.');

                // retorna datos migrados
                // return migratedQuotation;
            } catch (error) {
                console.error('Error al migrar las ventas:', error);
                // return undefined;
            }
        }

        // return storage;
    };


}