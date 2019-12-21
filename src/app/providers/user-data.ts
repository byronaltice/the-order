import { Injectable } from '@angular/core';
import { Events, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { BookService, UserRatings } from '../services/book.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface LoginInfo {
  username: string,
  admin: boolean,
  password: string
};
@Injectable({
  providedIn: 'root'
})
export class UserData {
  USER = 'user';
  private userInfo = new BehaviorSubject<LoginInfo>({ username: '.initialValue', admin: false, password: '.initialValue' });

  constructor(
    public events: Events,
    public storage: Storage,
    public bookService: BookService,
  ) {
  }

  login(username: string, admin: boolean, password: string): Promise<any> {
    console.debug('login', username, admin, password);
    return this.storage.set(this.USER, { username, admin, password }).then(() => {
      console.debug('e3mitting login with username', {username, admin, password});
      this.userInfo.next({ username, admin, password });
      // TODO is this necessarys omewhere? also see logout -> return this.events.publish('user:login');
    });
  }

  logout(): Promise<any> {
    return this.storage.remove(this.USER).then(() => {
      console.debug('emitting logout with blank yusername');
      this.userInfo.next({username: '', admin: false, password: '' });
    })
    /*.then(() => {
      this.events.publish('user:logout');
    });*/ 
  }

  load() {
    this.storage.get(this.USER).then(loginInfo => {
      console.debug('loading', loginInfo);
      this.userInfo.next(loginInfo);
    })
  }

  get loginInfo() {
    console.debug('getting the loginInfo observable');
    return this.userInfo.asObservable();
  }
}
