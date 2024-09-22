import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { error } from 'console';


const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json' }),
  responseType: 'text' as 'json' 
};

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private http: HttpClient) { }  

  public getAllCourses(): Observable<any> {
    return this.http.get(`${environment.apiServerUrl}/course/getAll`).pipe(
      map((response: any) => {
          return response;
      })
    )
  }
}
