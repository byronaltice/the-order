import { Component, OnInit } from '@angular/core';
import { Book, BookService, UserRatings as UserInfo } from '../../services/book.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserData, LoginInfo } from '../../providers/user-data';
import { OpaVoteService } from '../../services/opa-vote.service';
import { ToastOptions } from '@ionic/core';
import { Subject, of } from 'rxjs';
import { takeUntil, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  books: Book[];
  loginInfo: LoginInfo = {username: '', admin: false, password: ''};
  unsubscribe = new Subject<void>();
  allUsers: UserInfo[];
  isOpaVotePollOpen: boolean = true;
  opaVotePollId: string;
  opaVotePollResponse: {
    candidates: [],
    method: string,
    n_votes: number,
    title: string,
    results: {
      count: [],
      n_seats: number,
      n_votes: number,
      title: string,
      method: string,
      msg: string,
      winners: [number]
    },
    winners: [string]
  };
  opaVotePollWinner: string;
  pollStatus: string;

  constructor(
    private bookService: BookService,
    private userData: UserData,
    private alertController: AlertController,
    private router: Router,
    private opaVoteService: OpaVoteService,
    private toastController: ToastController,
  ) { }

  onRenderItems(event) {
    let draggedItem = this.books.splice(event.detail.from, 1)[0];
    const ratingsOfCurrentUser = this.getRatingsOfCurrentUser();
    this.books.splice(event.detail.to, 0, draggedItem);
    event.detail.complete();
    const newRankingsForThisUser = [{ bookId: '', rank: 0, bookName: '' }];
    this.books.forEach((book, rank) => {
      newRankingsForThisUser[rank] = { bookId: book.id, rank, bookName: book.task };
    });
    const userInfo: UserInfo = {
      userName: this.loginInfo.username,
      ratings: newRankingsForThisUser,
      password: this.loginInfo.password,
      review: (ratingsOfCurrentUser && ratingsOfCurrentUser.review) || { characters: 0, plot: 0, themes: 0, setting: 0, overall: 0 },
    };
    // Because if you provide an id to a new thing, it will bug out.
    if (ratingsOfCurrentUser) {
      userInfo.id = ratingsOfCurrentUser.id;
      this.bookService.updateRatings(userInfo)
    } else {
      this.bookService.addRatings(userInfo);
    }
  }
  async presentDeleteAllRatingsConfirmation() {
    const alert = await this.alertController.create({
      header: 'WAIT',
      message: 'Are you ABSOLUTELY SURE you want to delete ALL the users ratings??? NOT REVERSIBLE! Only use this to reset the polls between sessions, or if something goes really wrong.',
      backdropDismiss: false,
      buttons: [{
        text: 'OK DELETE EVERYTHING',
        role: 'Confirm',
        cssClass: 'primary',
        handler: () => {
          this.bookService.deleteRatings(this.allUsers);
        },
      }, {
        text: 'NO CANCEL',
        role: 'Cancel',
        cssClass: 'primary',
      }],
    });
    this.bookService.deleteRatings
    await alert.present();
  }
  async presentDeleteAllUsersConfirmation() {
    const alert = await this.alertController.create({
      header: 'WAIT',
      message: 'Are you ABSOLUTELY SURE you want to delete ALL the users??? NOT REVERSIBLE!',
      backdropDismiss: false,
      buttons: [{
        text: 'OK DELETE EVERYTHING',
        role: 'Confirm',
        cssClass: 'primary',
        handler: () => {
          this.bookService.deleteUsers(this.allUsers);
        },
      }, {
        text: 'NO CANCEL',
        role: 'Cancel',
        cssClass: 'primary',
      }],
    });
    await alert.present();
  }
  ngOnInit() {
    this.bookService.getRatings().pipe(
      mergeMap(() => this.bookService.getBooks(this.allUsers, this.loginInfo.username))
    ).subscribe(asdf => console.debug(asdf));
    // .subscribe(ratings => {
    //   this.allUsers = ratings;
    //   this.sortCurrentUsersBooksByRating();
    // });
    this.bookService.getBooks(this.allUsers, this.loginInfo.username).subscribe(bookList => {
      this.books = bookList;
    });
    this.pollStatus = "OPEN";
    this.bookService.getOpaVotePollStatuses().subscribe(pollStatuses => {
      this.isOpaVotePollOpen = pollStatuses[0] && pollStatuses[0].status;
      this.isOpaVotePollOpen = this.isOpaVotePollOpen === undefined ? this.isOpaVotePollOpen = true : this.isOpaVotePollOpen;
      this.pollStatus = this.isOpaVotePollOpen ? "OPEN" : "CLOSED";
      this.opaVotePollId = (pollStatuses[0] && pollStatuses[0].id) || '';
      this.opaVotePollWinner = pollStatuses[0].winner;
    });
  }
  getRatingsOfCurrentUser() {
    return this.allUsers && this.allUsers.find(rating => rating.userName === this.loginInfo.username);
  }
  async presentAlert() {
    console.debug('alert presented');
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
  ionViewWillEnter() {
    console.debug('ngOnInit home.page.ts');
    this.userData.loginInfo.pipe(takeUntil(this.unsubscribe)).subscribe(loginInfo => {
      console.debug('loginInfo', loginInfo);
      if (!loginInfo || !loginInfo.username) {
        this.unsubscribe.next();
        this.unsubscribe.complete();
        this.presentAlert();
        return;
      }
      this.loginInfo = loginInfo || { username: '', admin: false, password: '' };
    });
    this.userData.load();
    console.debug('ngOnInit after load');
  }
  sortCurrentUsersBooksByRating() {
    return;
    if (!this.allUsers || !this.books) {
      return this.books;
    }
    const currentUsersInfo = this.allUsers
      .find(userRating => userRating.userName === this.loginInfo.username);
    if (!currentUsersInfo) {
      return this.books;
    }
    return this.books.sort((currentBook, nextBook) =>
      (currentUsersInfo.ratings.find(a => a.bookId === currentBook.id) || {}).rank
      - (currentUsersInfo.ratings.find(a => a.bookId === nextBook.id) || {}).rank);
  }
  async vote(item) {
    const alert = await this.alertController.create({
      header: 'Remove Book',
      message: 'Book will be removed from the poll',
      backdropDismiss: false,
      buttons: [{
        text: 'OK',
        role: 'Confirm',
        cssClass: 'primary',
        handler: () => {
          this.remove(item);
          this.books = this.books.filter(book => book.id !== item);
        },
      }, {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'primary',
      }],
    });
    await alert.present();
  }
  remove(item) {
    this.bookService.removeBook(item.id);
  }
  async presentSubmitVotesConfirmation() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to close the poll?',
      backdropDismiss: false,
      buttons: [{
        text: 'Yes',
        role: 'Confirm',
        cssClass: 'primary',
        handler: () => {
          this.submitVotes();
        },
      }, {
        text: 'Cancel',
        role: 'Cancel',
        cssClass: 'primary',
        handler: () => {

        },
      }],
    });
    await alert.present();
  }
  submitVotes() {
    this.opaVoteService.submitVotes(this.books, this.allUsers)
      .subscribe(
        (response: {
          candidates: [],
          method: string,
          n_votes: number,
          title: string,
          results: {
            count: [],
            n_seats: number,
            n_votes: number,
            title: string,
            method: string,
            msg: string,
            winners: [number]
          },
          winners: [string]
        }) => {
          this.opaVotePollResponse = response;
          this.bookService.updateOpaVotePollStatus({ winner: response.winners[0], status: false, id: this.opaVotePollId }, this.opaVotePollId);

        });
  }
  getItems() {
    this.opaVoteService.getItems();
  }
  reopenPoll() {
    this.bookService.updateOpaVotePollStatus({ winner: 'TBD', status: true, id: this.opaVotePollId }, this.opaVotePollId);
  }
  doRefresh(event) {
    console.log('Begin async operation');

    setTimeout(() => {
      location.reload();
      window.location.reload();
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }
  async userSubmittedVotes() {
    const toastOptions: ToastOptions = {
      header: 'Votes Submitted',
      message: 'You can still <strong>change your mind</strong> while the poll is <strong>open</strong>. <br/>Just <strong>reorder your choices</strong> and <strong>tap CAST YOUR VOTES</strong> again.',
      position: 'top',
      showCloseButton: true,
    };
    const toast = await this.toastController.create(toastOptions);
    toast.present();
  }
}
