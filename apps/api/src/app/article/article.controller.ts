import { Controller, Get, Param } from '@nestjs/common';
import { ArticleService } from './article.service';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async getArticles() {
    try {
      const result = await this.articleService.getArticles();
      return { code: 200, data: result, success: true };
    } catch (err) {
      return { code: 404, message: err.message, data: null, success: false };
    }
  }

  @Get('/:id')
  async getArticle(@Param('id') id: string) {
    try {
      const result = await this.articleService.getArticle(id);
      return { code: 200, data: result, success: true };
    } catch (err) {
      return { code: 404, message: err.message, data: null, success: false };
    }
  }
  
}
