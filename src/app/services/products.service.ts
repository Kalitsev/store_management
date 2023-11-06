import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, tap } from "rxjs";
import { ProductModel } from "../models/product.model";

@Injectable({
  providedIn: 'root'
})

export class ProductsService {
  products$ = new BehaviorSubject<ProductModel[]>([])

  constructor(
    private http: HttpClient
  ) {
  }

  getProducts() {
    return this.http.get<ProductModel[]>('assets/helpers/products.json').pipe(
      tap(items => this.products$.next(items))
    )
  }
}
