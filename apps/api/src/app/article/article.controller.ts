import { Controller, Get } from '@nestjs/common';

import { Message } from '@hacknews/api-interfaces';

import { ArticleService } from './article.service';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async getArticles() {
    return await this.articleService.getArticles();
  }
}
