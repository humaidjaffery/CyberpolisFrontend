import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
})
export class UserModuleService {

  constructor(private http: HttpClient) { }

  public runCode(code: string[], module_id: string): Observable<any> {
    return this.http.post(`${environment.apiServerUrl}/userModule/runCode/${module_id}`, code, httpOptions).pipe(
      map((response: any) => {
          return response;
      })
    )
  }

  public saveCode(code: string[], module_id: string): Observable<any> {
    return this.http.put(`${environment.apiServerUrl}/userModule/saveCode/${module_id}`, code, httpOptions).pipe(
      map((response: any) => {
          return response;
      })
    )
  }

  public getUserModuleRelation(module_id: string): Observable<any> {
    return this.http.get(`${environment.apiServerUrl}/userModule/get/${module_id}`, httpOptions).pipe(
      map((response: any) => {
          return response;
      })
    )
  }

  public addUserModuleRelation(module_id: string): Observable<any> {
    return this.http.post(`${environment.apiServerUrl}/userModule/add/${module_id}`, httpOptions).pipe(
      map((response: any) => {
          return response;
      })
    )
  }

  public updateCorrectQuestion(module_id: string, questionsCorrect: boolean[]): Observable<any> {
    return this.http.put(`${environment.apiServerUrl}/userModule/update/correctQuestion/${module_id}`, questionsCorrect, httpOptions).pipe(
      map((response: any) => {
          return response;
      })
    )
  }
}
