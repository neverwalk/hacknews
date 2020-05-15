import { Controller, Get } from '@nestjs/common';
import { ArticleService } from './article.service';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async getArticles() {
    try {
      const result = await this.articleService.getArticles();
      return result;
    } catch (err) {
      return { data: [] };
    }
  }
}
