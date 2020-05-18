import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from '../models/article.model';
import { map } from 'rxjs/operators';

@Injectable()
export class ArticleService extends BaseService<Article> {
  constructor(protected http: HttpClient) {
    super(http);
    this.resourceURL = `articles`;
  }

  getArticles(page?: number): Observable<Article[]> {
    return this.doGet('', page ? `page=${page}`: '').pipe(
      map(res => {
        if (!res.success) {
          this.handleError(res);
        }
        return res.data;
      })
    );
  }

  getArticle(id: number): Observable<Article> {
    return this.doGet(`${id}`).pipe(
      map(res => {
        if (!res.success) {
          this.handleError(res);
        }
        return res.data;
      })
    );
  }
}
