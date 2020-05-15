import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@hacknews/api-interfaces';

@Component({
  selector: 'hacknews-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  hello$ = this.http.get('/api/articles');
  constructor(private http: HttpClient) {}
}
