import { Injectable } from '@nestjs/common';
import * as axios from 'axios';
import { parse } from 'node-html-parser';

@Injectable()
export class ArticleService {
  baseUrl = 'https://news.ycombinator.com/best';
  constructor() {}

  async getArticles(): Promise<any> {
    return (<any>axios)
      .get(this.baseUrl)
      .then(data => {
        const root = parse(data.data) as any;
        console.log(root);
        console.log(root.querySelectorAll('tr.athing'));
        return { data };
      })
      .catch(err => {
        return { message: 'Welcome to article api!' };
      });
  }
}
