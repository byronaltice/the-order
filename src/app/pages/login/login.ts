import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Router } from '@angular/router';
import { UserData, LoginInfo } from '../../providers/user-data';

import { BookService, UserRatings } from '../../services/book.service';



@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {
  loginInfo: LoginInfo;
  ratings: UserRatings[];

  constructor(
    public userData: UserData,
    public router: Router,
    public bookService: BookService,
  ) { }
  ngOnInit() {
    this.bookService.getRatings().subscribe(ratings => {
      this.ratings = ratings;
    });
    this.userData.loginInfo.subscribe(loginInfo => {
      this.loginInfo = loginInfo || {username: '', admin: false, password: ''};
    })
    this.userData.load();
  }

  onLogin(form: NgForm) {
    console.debug('onLogin form', form);
    console.debug('onLogin loginInfo', this.loginInfo);
    if (!form.valid) {
      return;
    }
    let exists = this.ratings && this.ratings.find(rating => rating.userName.toLowerCase() === this.loginInfo.username.toLowerCase());
    if (!exists) {
      
      const userInfo: UserRatings = {
        userName: this.loginInfo.username,
        ratings: [],
        password: this.loginInfo.password,
        review: {characters: 0, plot: 0, themes: 0, setting: 0, overall: 0},
      };
      this.bookService.addRatings(userInfo);
    }
    this.userData.login(
      this.loginInfo.username,
      this.loginInfo.username.toLowerCase() === 'byron' && this.loginInfo.password === 'admin1234', 
      this.loginInfo.password)
    .then(() => this.router.navigateByUrl('/tabs'));
  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }
}
