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
  page: number;
  isLoading = false;
  constructor(private router: Router, private articleService: ArticleService) {}

  ngOnInit(): void {
    this.page = 1;
    this.isLoading = true;
    this.articleService.getArticles(this.page).subscribe(res => {
      this.listArticles = res;
      this.page++;
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
    })
  }

  navigateToArticleDetail(id) {
    this.router.navigateByUrl('articles', id);
  }

  loadMore(page) {
    this.isLoading = true;
    this.articleService.getArticles(page).subscribe(res => {
      this.listArticles = [...this.listArticles, ...res];
      this.page++;
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
    });
  }
}
