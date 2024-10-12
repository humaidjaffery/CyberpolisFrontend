import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }  

  public sendMessage(moduleId: String, message: String, highlights: String[] ): Observable<any> {
    return this.http.post(`${environment.apiServerUrl}/chat/newMessage/${moduleId}`, {"message": message, "highlights": highlights}).pipe(
      map((response: any) => {
          return response;
      })
    )
  }
}
