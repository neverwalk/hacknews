import { Injectable } from '@nestjs/common';
import * as axios from 'axios';
import { parse } from 'node-html-parser';
import * as extractor from 'unfluff';
import { truncate } from 'lodash';

import { CacheService } from '../cache.service';
import { Constants } from '../helpers/constants';
import { Utility } from '../helpers';

@Injectable()
export class ArticleService {
  newsUrl = Constants.newsURL;
  baseUrl = Constants.baseURL;
  constructor() {}

  async getArticles(page?: number): Promise<any> {
    return await this.crawlArticles(page);
  }

  async getArticle(id): Promise<any> {
    return await this.getContentByUrl(id);
  }

  private async crawlArticles(page?: number) {
    const crawlUrl = `${this.newsUrl}${page ? '?p=' + page : ''}`;
    return (<any>axios)
      .get(crawlUrl)
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
          delete article.contentHTML;
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
          this.getContentByUrl(
            element.id,
            aChildElement.attributes['href'],
            aChildElement.innerHTML
          )
        );
      } else {
        listArticlesFunc.push(
          this.getContentByUrl(
            element.id,
            this.baseUrl + aChildElement.attributes['href'],
            aChildElement.innerHTML
          )
        );
      }
    });
    return Promise.all(listArticlesFunc);
  }

  private getContentByUrl(id, url?, defaultTitle?) {
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

        const contentHTML = this.getContentHTML(
          root,
          dataParsed.text().replace(dataParsed.title(), '')
        );

        const result = {
          title: dataParsed.title() || defaultTitle,
          text: dataParsed.text(),
          image: dataParsed.image(),
          id: id,
          url: url,
          contentHTML: this.formatContent(contentHTML, Utility.getBaseUrlFromUrl(url))
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

  private getContentHTML(rootElement, textInside) {
    const sampleTextInside = textInside.slice(0, 25);
    const sampleTextInside2 = textInside.slice(50, 75);
    const sampleTextInside3 = textInside.slice(100, 125);
    const sampleTextInside4 = textInside.slice(150, 175);
    const sampleTextInside5 = textInside.slice(200, 225);

    const paragraphElements = rootElement.querySelectorAll('p');

    let elementInsideContent;
    for (const paragraphElement of paragraphElements) {
      if (
        paragraphElement.innerHTML.includes(sampleTextInside) ||
        paragraphElement.innerHTML.includes(sampleTextInside2) ||
        paragraphElement.innerHTML.includes(sampleTextInside3) ||
        paragraphElement.innerHTML.includes(sampleTextInside4) ||
        paragraphElement.innerHTML.includes(sampleTextInside5)
      ) {
        elementInsideContent = paragraphElement;
        break;
      }
    }

    const contentNode = this.getContentNode(elementInsideContent);
    const contentReturn = contentNode
      ? contentNode.innerHTML
      : textInside;
    return contentReturn;
  }

  private getContentNode(childNode) {
    let contentNode;
    let currentNode = childNode;
    while (!contentNode && currentNode) {
      if (this.checkPossibleContentElement(currentNode)) {
        contentNode = currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }
    return contentNode;
  }

  private checkPossibleContentElement(nodeElement) {
    const possibleClasses = [
      'content',
      'article-main',
      'article-body',
      'entryText',
      'post'
    ];
    const possibleTags = ['section', 'article'];

    for (let i = 0; i < possibleClasses.length; i++) {
      if (nodeElement.rawAttrs.includes(possibleClasses[i])) {
        return true;
      }
    }

    for (let i = 0; i < possibleTags.length; i++) {
      if (nodeElement.tagName === possibleTags[i]) {
        return true;
      }
    }

    return false;
  }

  private formatContent(baseContent, baseUrl) {
    const contentWithSimpleElements = baseContent.replace(
      /(<\/?(?:a|p|img|b|i)[^>]*>)|<[^>]+>/gi,
      '$1'
    )
    const root = parse(contentWithSimpleElements) as any;
    const listATags = root.querySelectorAll('a');

    listATags.forEach(aElement => {
      if (aElement.attributes['href'] && !aElement.attributes['href'].includes('http')) {
        aElement.setAttribute(
          'href',
          baseUrl + aElement.attributes['href']
        );
      }
    });

    const listImgTags = root.querySelectorAll('img');

    listImgTags.forEach(imgElement => {
      if (imgElement.attributes['src'] && !imgElement.attributes['src'].includes('http')) {
        imgElement.setAttribute(
          'src',
          baseUrl + imgElement.attributes['src']
        );
      }
    });

    return root.toString();
  }
}
