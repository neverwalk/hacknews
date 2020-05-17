import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../services/article.service';
import { Router } from '@angular/router';

@Component({
  selector: 'hacknews-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  listArticles = [];
  constructor(private router: Router, private articleService: ArticleService) {}

  ngOnInit(): void {
    this.articleService.getArticles().subscribe(res => {
      this.listArticles = res;
    })
  }

  navigateToArticleDetail(id) {
    this.router.navigateByUrl('articles', id);
  }
}
