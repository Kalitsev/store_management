import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl, Validators, FormGroup } from "@angular/forms";
import { combineLatest, ReplaySubject, takeUntil, map } from "rxjs";
import { ProductInStoreModel } from "../../models/product-in-store.model";
import { ProductModel } from "../../models/product.model";
import { StoreCardModel } from "../../models/store-card.model";
import { StoreModel } from "../../models/store.model";
import { ProductsService } from "../../services/products.service";
import { StoresService } from "../../services/stores.service";

@Component({
    selector: 'app-stores',
    templateUrl: './stores.component.html',
    styleUrls: ['./stores.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush

})

export class StoresComponent implements OnInit, OnDestroy {

    products$ = this.productsService.products$
    storeCards: StoreCardModel[] = [];
    newProducts: ProductInStoreModel[] = [];

    newStoreForm: FormGroup = new FormGroup({
        storeName: new FormControl('', [Validators.required, Validators.minLength(3)]),
        productName: new FormControl(),
        amountProduct: new FormControl(null),
        hasInventory: new FormControl(false)
    });

    destroy$ = new ReplaySubject<void>(1)

    constructor(
        private storesService: StoresService,
        private productsService: ProductsService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        combineLatest([this.storesService.stores$, this.productsService.products$])
            .pipe(
                map(([stores, products]) => {
                    const newStoreCards = stores.map(store => {
                        const total = store.products.reduce((sum, product) => sum + product.amount, 0);
                        const popularProduct = this.findPopularProduct(store.products);
                        const leastPopularProductWithDetails = this.findProductName(popularProduct, products);
                        return {
                            name: store.name,
                            total,
                            leastPopularProduct: leastPopularProductWithDetails,
                            products: store.products
                        };
                    });
                    return newStoreCards.sort((a, b) => b.total - a.total);
                }),
                takeUntil(this.destroy$))
            .subscribe(sortedNewStoreCards => {
                this.storeCards = sortedNewStoreCards;
                this.changeDetectorRef.detectChanges();
            });
    }

    ngOnDestroy() {
        this.destroy$.next()
        this.destroy$.complete()
    }

    findPopularProduct(products: ProductInStoreModel[]) {
        return products.reduce((minProduct, currentProduct) => {
            if (currentProduct.amount < minProduct.amount) {
                return currentProduct;
            } else {
                return minProduct;
            }
        }, products[0]);
    }

    findProductName(popularProduct: ProductInStoreModel, products: ProductModel[]) {
        const productDetails = products.find(p => p.id === popularProduct.id);
        return productDetails ? {
            id: popularProduct.id,
            amount: popularProduct.amount,
            name: productDetails.name
        } : popularProduct;
    }

    addProduct() {
        const amount = this.newStoreForm.controls['amountProduct'].value || 0;
        const selectedProductName = this.newStoreForm.controls['productName'].value;
        const selectedProduct = this.products$.value.find(product => product.name === selectedProductName);
        if (amount >= 0 && selectedProduct) {
            this.newProducts.push({id: selectedProduct.id, name: selectedProduct.name, amount});
            this.newStoreForm.controls['productName'].setValue(null)
            this.newStoreForm.controls['amountProduct'].setValue(null)
        }
    }

    addStore() {
        const newStore: StoreModel = {
            name: this.newStoreForm.controls['storeName'].value || 'store',
            products: this.newProducts.map(product => ({id: product.id, amount: product.amount}))
        };
        this.storesService.stores$.next([...this.storesService.stores$.value, newStore]);
        this.newProducts = []
        this.newStoreForm.reset()
        this.changeDetectorRef.detectChanges()
    }

    removeProduct(id: number) {
        this.newProducts = this.newProducts.filter(product => product.id !== id);
    }

    removeStore(storeName: string) {
        this.storesService.stores$.next(this.storesService.stores$.value.filter(store => store.name !== storeName));
    }

    hasInventory() {
        if (this.newStoreForm.controls['hasInventory'].value) {
            this.newProducts = []
        } else {
            this.newStoreForm.controls['productName'].setValue(null)
            this.newStoreForm.controls['amountProduct'].setValue(null)
        }
    }
}

