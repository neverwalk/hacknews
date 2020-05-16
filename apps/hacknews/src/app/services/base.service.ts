import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Constants, Utility } from '../helpers';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class BaseService<T> {
  protected domain = Constants.DomainURL;
  private _resourceURL: string;
  private _tokenKey: string;

  constructor(protected http: HttpClient) {}

  protected set resourceURL(value: string) {
    this._resourceURL = `${this.domain}/${value}`;
  }

  protected doGet(apiUrl: string, queryParams?: string): Observable<any> {
    const header: HttpHeaders = this.createHeader('json');
    let url = this.getUrl(apiUrl);
    url = queryParams === undefined ? url : `${url}?${queryParams}`;

    return this.http
      .get(url, { headers: header })
      .pipe(catchError(this.handleError.bind(this)));
  }

  protected doPost(apiUrl: string, data: any): Observable<any> {
    const bodyString = JSON.stringify(data);
    const header = this.createHeader();

    return this.http
      .post(this.getUrl(apiUrl), bodyString, { headers: header })
      .pipe(catchError(this.handleError.bind(this)));
  }

  protected doPostFileObject(
    apiUrl: string,
    data: any,
    key: string = ''
  ): Observable<any> {
    const formData = this.getModelAsFormData(data, key);
    this._tokenKey = localStorage.getItem('auth_token');
    const headers = new HttpHeaders();
    if (this._tokenKey !== undefined) {
      headers.append('Authorization', `${this._tokenKey}`);
    }
    return this.http
      .post(this.getUrl(apiUrl), formData, { headers: headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  protected doPut(apiUrl: string, data: any): Observable<any> {
    const bodyString = JSON.stringify(data);
    const header = this.createHeader();

    return this.http
      .put(this.getUrl(apiUrl), bodyString, { headers: header })
      .pipe(catchError(this.handleError.bind(this)));
  }

  protected doDelete(apiUrl: string): Observable<any> {
    const header = this.createHeader();

    return this.http
      .delete(this.getUrl(apiUrl), { headers: header })
      .pipe(catchError(this.handleError.bind(this)));
  }

  protected handleError(error: any) {
    console.log('error status = ' + error.status, error);
    return throwError(error);
  }

  delete(id: number | string): Observable<boolean> {
    return this.doDelete(id.toString()).pipe(map(res => {
      if (!res.success) {
        this.handleError(res);
      }

      return res.success;
    }));
  }

  create(entity: T): Observable<T> {
    return this.doPost('', entity).pipe(map(res => {
      if (!res.success) {
        this.handleError(res);
      }

      return res.data;
    }));
  }

  update(entity: T): Observable<T> {
    return this.doPut((entity as any).id.toString(), entity).pipe(map(res => {
      if (!res.success) {
        this.handleError(res);
      }

      return res.data;
    }));
  }

  private getUrl(apiUrl: string) {
    return apiUrl
      ? Utility.resolveUrls(this._resourceURL, apiUrl)
      : this._resourceURL;
  }

  private createHeader(type: string = ''): HttpHeaders {
    this._tokenKey = localStorage.getItem('access_token');
    let contentType = '';
    const headers = {};

    if (this._tokenKey) {
      headers['Authorization'] = `Bearer ${this._tokenKey}`;
    }

    switch (type) {
      case '':
      case 'json':
        contentType = 'application/json';
        break;
      case 'authentication':
        contentType = 'application/x-www-form-urlencoded';
        break;
      case 'text':
        contentType = 'text/plain';
        break;
      case 'file':
        contentType = '';
        break;
    }

    if (contentType.length > 0) {
      headers['Content-Type'] = contentType;
    }

    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] =
      'GET, POST, OPTIONS, PUT, PATCH, DELETE';
    headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type';
    headers['GEM-All-Language'] = '1';
    headers['GEM-All-Currency'] = '1';
    return new HttpHeaders({
      ...headers
    });
  }

  private getModelAsFormData(data: any, override_key: string = '') {
    const dataAsFormData = new FormData();

    // create instance vars to store keys and final output
    const keyArr: any[] = Object.keys(data);

    // loop through the object,
    // pushing values to the return array
    keyArr.forEach((key: any) => {
      dataAsFormData.append(override_key ? override_key : key, data[key]);
    });

    // return the resulting array
    return dataAsFormData;
  }
}
