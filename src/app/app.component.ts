import { Component, OnInit } from '@angular/core';
import { ProductsService } from "./services/products.service";
import { StoresService } from "./services/stores.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'store_management';

  constructor(
    private storesService: StoresService,
    private productsService: ProductsService
  ) {
  }

  ngOnInit() {
    this.getStores()
    this.getProducts()
  }

  getStores(){
    this.storesService.getStores().subscribe()
  }

  getProducts(){
    this.productsService.getProducts().subscribe()
  }
}
