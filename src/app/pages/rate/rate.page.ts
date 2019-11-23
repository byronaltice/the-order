import { Component, OnInit } from '@angular/core';
import { UserData } from '../../providers/user-data';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { BookService, UserRatings, Review } from '../../services/book.service';

@Component({
  selector: 'app-rate',
  templateUrl: 'rate.page.html',
  styleUrls: ['rate.page.scss'],
})
export class RatePage implements OnInit {

  bookRating: any;
  user: UserRatings;
  reviews: { key: string, value: any }[];
  averageReviews: any;
  userName: string;
  loaded: boolean = false;
  averageReviewsAsArray: { key: string, value: any }[];
  ratingsFromBookService: UserRatings[];
  constructor(
    private userData: UserData,
    private router: Router,
    private alertController: AlertController,
    private bookService: BookService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (!this.loaded) {
      setTimeout(() => this.userData.getPassword().then(password => {
        this.userData.getUsername().then(userName => {
          if (!userName) {
            this.presentAlert();
            return;
          }
          this.userName = userName;

          this.bookService.getRatings().subscribe(ratings => {
            this.ratingsFromBookService = ratings;
            this.reviews = [{ key: 'overall', value: 0 },
            { key: 'plot', value: 0 },
            { key: 'setting', value: 0 },
            { key: 'theme', value: 0 },
            { key: 'characters', value: 0 }];
            this.bookRating = {
              overall: 0,
              characters: 0,
              setting: 0,
              plot: 0,
              themes: 0,
            };
            let newArray = { totalCharacters: 0, totalOverall: 0, totalPlot: 0, totalSetting: 0, totalTheme: 0, number: 0 };
            this.averageReviews = this.ratingsFromBookService.reduce((pre, cur) => {
              if (cur.review && cur.review.characters !== 0) {
                pre["totalCharacters"] += cur.review.characters;
                pre["totalOverall"] += cur.review.overall;
                pre["totalPlot"] += cur.review.plot;
                pre["totalSetting"] += cur.review.setting;
                pre["totalTheme"] += cur.review.themes;
                pre.number += 1;
              }
              return pre;
            }, newArray);
            this.averageReviews.averageCharacters = Number(this.averageReviews.totalCharacters / this.averageReviews.number).toFixed(2)
            this.averageReviews.averageOverall = Number(this.averageReviews.totalOverall / this.averageReviews.number).toFixed(2)
            this.averageReviews.averagePlot = Number(this.averageReviews.totalPlot / this.averageReviews.number).toFixed(2)
            this.averageReviews.averageSetting = Number(this.averageReviews.totalSetting / this.averageReviews.number).toFixed(2)
            this.averageReviews.averageTheme = Number(this.averageReviews.totalTheme / this.averageReviews.number).toFixed(2)
            this.averageReviews = {
              Characters: this.averageReviews.averageCharacters,
              Overall: this.averageReviews.averageOverall,
              Plot: this.averageReviews.averagePlot,
              Setting: this.averageReviews.averageSetting,
              Theme: this.averageReviews.averageTheme
            }
            this.averageReviewsAsArray = Object.entries(this.averageReviews).map(entry => ({
              key: entry[0],
              value: entry[1]
            }))
            this.user = this.ratingsFromBookService.find(rating => rating.userName.toLowerCase() === this.userName.toLowerCase());
            if (this.user) {
              this.reviews = Object.entries(this.user.review).map((entry) => ({
                key: entry[0],
                value: entry[1]
              })
              )
            }
            if (this.reviews.filter(review => review.value === 0).length > 0) {
              this.averageReviewsAsArray = [];
            }
            this.loaded = true;

            if (!(window.localStorage.getItem('voteLoaded') === 'true')) {
              window.localStorage.setItem('voteLoaded', 'true');
              this.router.navigateByUrl('/tabs/vote');
            }
          });
        })
      }))
    } else {
      if (!this.ratingsFromBookService) {
        return;
      }
      this.reviews = [{ key: 'overall', value: 0 },
      { key: 'plot', value: 0 },
      { key: 'setting', value: 0 },
      { key: 'theme', value: 0 },
      { key: 'characters', value: 0 }];
      this.bookRating = {
        overall: 0,
        characters: 0,
        setting: 0,
        plot: 0,
        themes: 0,
      };
      let newArray = { totalCharacters: 0, totalOverall: 0, totalPlot: 0, totalSetting: 0, totalTheme: 0, number: 0 };
      this.averageReviews = this.ratingsFromBookService.reduce((pre, cur) => {
        if (cur.review) {
          pre["totalCharacters"] += cur.review.characters;
          pre["totalOverall"] += cur.review.overall;
          pre["totalPlot"] += cur.review.plot;
          pre["totalSetting"] += cur.review.setting;
          pre["totalTheme"] += cur.review.themes;
          pre.number += 1;
        }
        return pre;
      }, newArray);
      this.averageReviews.averageCharacters = Number(this.averageReviews.totalCharacters / this.averageReviews.number).toFixed(2)
      this.averageReviews.averageOverall = Number(this.averageReviews.totalOverall / this.averageReviews.number).toFixed(2)
      this.averageReviews.averagePlot = Number(this.averageReviews.totalPlot / this.averageReviews.number).toFixed(2)
      this.averageReviews.averageSetting = Number(this.averageReviews.totalSetting / this.averageReviews.number).toFixed(2)
      this.averageReviews.averageTheme = Number(this.averageReviews.totalTheme / this.averageReviews.number).toFixed(2)
      this.averageReviews = {
        Characters: this.averageReviews.averageCharacters,
        Overall: this.averageReviews.averageOverall,
        Plot: this.averageReviews.averagePlot,
        Setting: this.averageReviews.averageSetting,
        Theme: this.averageReviews.averageTheme
      }
      this.averageReviewsAsArray = Object.entries(this.averageReviews).map(entry => ({
        key: entry[0],
        value: entry[1]
      }))
      this.user = this.ratingsFromBookService.find(rating => rating.userName.toLowerCase() === this.userName.toLowerCase());
      if (this.user) {
        this.reviews = Object.entries(this.user.review).map((entry) => ({
          key: entry[0],
          value: entry[1]
        })
        )
      }
      if (this.reviews.filter(review => review.value === 0).length > 0) {
        this.averageReviewsAsArray = [];
      }
    }
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Uh Oh',
      message: 'You need to log in',
      backdropDismiss: false,
      buttons: [{
        text: 'Go To Log In Page',
        role: 'Confirm',
        cssClass: 'primary',
        handler: () => {
          this.router.navigateByUrl('/login');
        },
      }],
    });
    await alert.present();
  }
  async saveBookRating() {
    this.bookRating = this.reviews.reduce((pre, cur) => {
      pre[cur.key] = cur.value
      return pre;
    }, {})
    if (this.bookRating.characters === 0 ||
      this.bookRating.overall === 0 ||
      this.bookRating.plot === 0 ||
      this.bookRating.setting === 0 ||
      this.bookRating.themes === 0) {
      const alert = await this.alertController.create({
        header: 'Woops',
        message: 'Make sure you entered a rating for everything',
        backdropDismiss: false,
        buttons: [{
          text: 'Sorry',
          role: 'Confirm',
          cssClass: 'primary',
          handler: () => {
          },
        }],
      });
      await alert.present();
      return;
    }
    this.user.review = this.bookRating;
    if (this.user) {
      this.bookService.updateRatings(this.user);
    }
    const alert = await this.alertController.create({
      header: 'Submitted',
      message: 'Your ratings have been recorded, but you can change them anytime and re-submit. Take a look at the top right for the results.',
      backdropDismiss: false,
      buttons: [{
        text: 'OK',
        role: 'Confirm',
        cssClass: 'primary',
        handler: () => {
        },
      }],
    });
    await alert.present();
  }
  onRateChange(rating, key) {
    this.reviews.find(review => review.key == key).value = rating
  }
}
