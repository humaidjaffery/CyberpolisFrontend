import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { isPlatformBrowser } from '@angular/common';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  
  constructor(private http: HttpClient) { }
  
  public getAllFromCourse(courseName: string): Observable<any> {
    return this.http.get(`${environment.apiServerUrl}/module/getAllFromCourse/${courseName}`, httpOptions).pipe(
      map((response: any) => {
        console.log(response)
        console.log(typeof(response))
          return response;
      })
    )
  }

  public getModule(moduleId: String): Observable<any> {
    return this.http.get(`${environment.apiServerUrl}/module/get/${moduleId}`, httpOptions).pipe(
      map((response: any) => {
          return response;
      })
    )
  }
  
}
