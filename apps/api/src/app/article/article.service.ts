import { Injectable } from '@nestjs/common';
import * as axios from 'axios';
import { parse } from 'node-html-parser';
import * as extractor from 'unfluff';
import { truncate } from 'lodash';

import { CacheService } from '../cache.service';
import { Constants } from '../helpers/constants';

@Injectable()
export class ArticleService {
  newsUrl = Constants.newsURL;
  baseUrl = Constants.baseURL;
  constructor() {}

  async getArticles(): Promise<any> {
    return await this.crawlArticles();
  }

  async getArticle(id): Promise<any> {
    return await this.getContextByUrl(id);
  }

  private async crawlArticles() {
    return (<any>axios)
      .get(this.newsUrl)
      .then(async data => {
        const root = parse(data.data) as any;
        const listArticles = root.querySelectorAll('tr.athing');
        let listArticlesParsed = await this.parseListNews(listArticles);

        listArticlesParsed = listArticlesParsed.map(article => {
          article.text = truncate(article.text, {
            length: 200,
            omission: '...',
            separator: ' '
          });
          return article;
        });
        return listArticlesParsed;
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
          this.getContextByUrl(
            element.id,
            aChildElement.attributes['href'],
            aChildElement.innerHTML
          )
        );
      } else {
        listArticlesFunc.push(
          this.getContextByUrl(
            element.id,
            this.baseUrl + aChildElement.attributes['href'],
            aChildElement.innerHTML
          )
        );
      }
    });

    return Promise.all(listArticlesFunc);
  }

  private getContextByUrl(id, url?, defaultTitle?) {
    const getValueFromCache = CacheService.cache.get(id);
    if (getValueFromCache !== undefined) {
      return getValueFromCache;
    } else if (getValueFromCache === undefined && url === undefined) {
      const result = {
        id: id,
        title: 'Resource is not existed'
      };
      return result;
    }
    return (<any>axios)
      .get(url)
      .then(data => {
        const dataParsed = extractor.lazy(data.data, 'en');

        const root = parse(data.data) as any;

        const contentInnerHTML = this.getContentInnerHTML(root, dataParsed.text().replace(dataParsed.title(), ''));

        const result = {
          title: dataParsed.title() || defaultTitle,
          text: dataParsed.text(),
          image: dataParsed.image(),
          id: id,
          url: url,
          innerHTML: contentInnerHTML,
        };
        CacheService.cache.set(id, result);
        return result;
      })
      .catch(err => {
        console.log(err);
        const result = {
          id: id,
          url: url,
          title: 'Resource is not existed'
        };
        CacheService.cache.set(id, result);
        return result;
      });
  }

  private getContentInnerHTML(rootElement, textInside) {
    const smallTextInside = truncate(textInside, {
      length: 25,
      omission: '',
      separator: ' '
    });

    console.log(smallTextInside);
    const paragraphElements = rootElement.querySelectorAll('p');

    let elementInsideContent;
    for (const paragraphElement of paragraphElements) {
      if (paragraphElement.innerHTML.includes(smallTextInside)) {
        elementInsideContent = paragraphElement;
        break;
      }
    }
    
    const contentNode = this.getContentNode(elementInsideContent);
    return contentNode ? contentNode.innerHTML : textInside;
  }

  private getContentNode(childNode) {
    let contentNode;
    let currentNode = childNode;
    while (!contentNode && currentNode && currentNode.parentNode) {
      if (
        (currentNode.parentNode.attributes['class'] &&
        currentNode.parentNode.attributes['class'].includes('content'))
        || currentNode.parentNode.attributes['id'] &&
        currentNode.parentNode.attributes['id'].includes('content')
      ) {
        contentNode = currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }
    return contentNode;
  }
}
