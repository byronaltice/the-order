import { Component, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Router } from '@angular/router';
import { UserData } from '../../providers/user-data';

import { UserOptions } from '../../interfaces/user-options';
import { BookService, UserRatings } from '../../services/book.service';



@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {
  login: UserOptions = { username: '', password: '' };
  submitted = false;
  ratings: UserRatings[];

  constructor(
    public userData: UserData,
    public router: Router,
    public bookService: BookService,
  ) { }
  ngOnInit() {
    this.bookService.getRatings().subscribe(ratings => {
      this.ratings = ratings;
    })
  }

  onLogin(form: NgForm) {
    
    this.submitted = true;
    if (form.valid) {
      let exists = this.ratings && this.ratings.find(rating => rating.userName.toLowerCase() === this.login.username.toLowerCase());
      if (!exists) {
        
        const userInfo: UserRatings = {
          userName: this.login.username,
          ratings: [],
          password: this.login.password,
          review: {characters: 0, plot: 0, themes: 0, setting: 0, overall: 0},
        };
        this.bookService.addRatings(userInfo);
      }
      this.userData.login(
        this.login.username, 
        this.login.username.toLowerCase() === 'byron' && this.login.password === 'admin1234', 
        this.login.password)
      .then(() => this.router.navigateByUrl('/tabs'));
    }
  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }
}
