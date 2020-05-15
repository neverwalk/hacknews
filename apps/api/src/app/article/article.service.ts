import { Injectable } from '@nestjs/common';
import * as axios from 'axios';
import { parse } from 'node-html-parser';
import * as extractor from 'unfluff';
import { CacheService } from '../cache.service';

@Injectable()
export class ArticleService {
  baseUrl = 'https://news.ycombinator.com/best';
  constructor() {}

  async getArticles(): Promise<any> {
    return await this.crawlArticles();
  }

  private async crawlArticles() {
    return (<any>axios)
      .get(this.baseUrl)
      .then(async data => {
        const root = parse(data.data) as any;
        const listArticles = root.querySelectorAll('tr.athing');
        const listArticlesParsed = await this.parseListNews(listArticles);
        return { data: listArticlesParsed };
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }

  private parseListNews(listArticles) {
    const listArticlesFunc = [];
    listArticles.forEach(async (element: HTMLElement) => {
      const aChildElement = element.querySelector('a.storylink');
      if (aChildElement.attributes['href'].includes('http')) {
        listArticlesFunc.push(
          this.getContextByUrl(aChildElement.attributes['href'], element.id)
        );
      } else {
        listArticlesFunc.push(
          this.getContextByUrl(
            `https://news.ycombinator.com/` + aChildElement.attributes['href'],
            element.id
          )
        );
      }
    });

    return Promise.all(listArticlesFunc);
  }

  private getContextByUrl(url, id) {
    console.log(url);
    const getValueFromCache = CacheService.cache.get(id);
    if (getValueFromCache !== undefined) {
      return getValueFromCache;
    }
    return (<any>axios)
      .get(url)
      .then(data => {
        const dataParsed = extractor.lazy(data.data);
        const result = {
          title: dataParsed.title(),
          text: dataParsed.text(),
          image: dataParsed.image(),
          id: id,
          url: url
        };
        CacheService.cache.set(id, result);
        return result;
      })
      .catch(err => {
        console.log(err);
        const result = {
          id: id,
          url: url,
          title: 'Url is not existed'
        };
        CacheService.cache.set(id, result);
        return result;
      });
  }
}
