import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ArticleService } from '../services/article.service';
import { Article } from '../models/article.model';

@Component({
  selector: 'hacknews-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {
  article: Article = new Article();
  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    const currentArticleId = this.route.snapshot.params['id'];
    this.articleService.getArticle(currentArticleId).subscribe(res => {
      this.article = res;
    });
  }
}
