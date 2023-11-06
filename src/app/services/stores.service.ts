import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, tap } from "rxjs";
import { StoreModel } from "../models/store.model";

@Injectable({
  providedIn: 'root'
})

export class StoresService {
  stores$ = new BehaviorSubject<StoreModel[]>([])

  constructor(
    private http: HttpClient
  ) {
  }

  getStores() {
    return this.http.get<StoreModel[]>('assets/helpers/stores.json').pipe(
      tap(items => this.stores$.next(items))
    )
  }
}
