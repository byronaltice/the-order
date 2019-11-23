import { Injectable } from '@angular/core';
import { Events, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ValueAccessor } from '@ionic/angular/dist/directives/control-value-accessors/value-accessor';
import { BookService, UserRatings } from '../services/book.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class UserData {
  _favorites: string[] = [];
  HAS_LOGGED_IN = 'hasLoggedIn';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
  ratings: UserRatings[];

  constructor(
    public events: Events,
    public storage: Storage,
    public bookService: BookService,
    private alertController: AlertController,
    private router: Router,
  ) {
    this.bookService.getRatings().subscribe(ratings => {
      this.ratings = ratings;
    })
  }

  hasFavorite(sessionName: string): boolean {
    return (this._favorites.indexOf(sessionName) > -1);
  }

  addFavorite(sessionName: string): void {
    this._favorites.push(sessionName);
  }

  removeFavorite(sessionName: string): void {
    const index = this._favorites.indexOf(sessionName);
    if (index > -1) {
      this._favorites.splice(index, 1);
    }
  }

  login(username: string, admin: boolean, password: string): Promise<any> {
    return this.storage.set(this.HAS_LOGGED_IN, true).then(() => {
      this.setUsername(username);
      const user = this.ratings.find(rating => rating.userName === username);
      this.setUsername(username);
      this.setPassword(password);
      this.setAdmin(username === 'byron');
      return this.events.publish('user:login');
    });
  }
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Uh Oh',
      message: 'Your password isn\'t right',
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
  signup(username: string): Promise<any> {
    return this.storage.set(this.HAS_LOGGED_IN, true).then(() => {
      this.setUsername(username);
      return this.events.publish('user:signup');
    });
  }

  logout(): Promise<any> {
    return this.storage.remove(this.HAS_LOGGED_IN).then(() => {
      return this.storage.remove('username');
    }).then(() => {
      this.events.publish('user:logout');
    });
  }

  setUsername(username: string): Promise<any> {
    return this.storage.set('username', username);
  }

  getUsername(): Promise<string> {
    return this.storage.get('username').then((value) => {
      return value;
    });
  }

  setAdmin(admin: boolean): Promise<any> {
    return this.storage.set('isAdmin', admin);
  }

  isAdmin(): Promise<boolean> {
    return this.storage.get('isAdmin').then(value => {
      return value;
    });
  }

  setPassword(password: string): Promise<any> {
    return this.storage.set('password', password);
  }

  getPassword(): Promise<string> {
    return this.storage.get('password').then(value => {
      return value;
    });
  }

  isLoggedIn(): Promise<boolean> {
    return this.storage.get(this.HAS_LOGGED_IN).then((value) => {
      return value === true;
    });
  }

  checkHasSeenTutorial(): Promise<string> {
    return this.storage.get(this.HAS_SEEN_TUTORIAL).then((value) => {
      return value;
    });
  }
}
