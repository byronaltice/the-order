import { Component, OnInit } from '@angular/core';
import { Todo, TodoService, UserRatings as UserInfo } from '../../services/todo.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserData } from '../../providers/user-data';
import { OpaVoteService } from '../../services/opa-vote.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  todos: Todo[];
  userName: string;
  password: string;
  allUsers: UserInfo[];
  isAdmin: boolean = false;
  isOpaVotePollOpen: boolean = false;
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

  constructor(
    private todoService: TodoService,
    private userData: UserData,
    private alertController: AlertController,
    private router: Router,
    private opaVoteService: OpaVoteService,
  ) { }

  onRenderItems(event) {
    let draggedItem = this.todos.splice(event.detail.from, 1)[0];
    const ratingsOfCurrentUser = this.getRatingsOfCurrentUser();
    this.todos.splice(event.detail.to, 0, draggedItem);
    event.detail.complete();
    const newRankingsForThisUser = [{ bookId: '', rank: 0, bookName: '' }];
    this.todos.forEach((book, rank) => {
      newRankingsForThisUser[rank] = { bookId: book.id, rank, bookName: book.task };
    });
    const userInfo: UserInfo = {
      userName: this.getUserName(), 
      ratings: newRankingsForThisUser,
      password: this.getPassword(),
    };
    // Because if you provide an id to a new thing, it will bug out.
    if(ratingsOfCurrentUser) {
      userInfo.id = ratingsOfCurrentUser.id;
      this.todoService.updateRatings(userInfo)
    } else {
      this.todoService.addRatings(userInfo);
    }
  }
  ngOnInit() {

  }
  getRatingsOfCurrentUser() {
    return this.allUsers && this.allUsers.find(rating => rating.userName === this.getUserName());
  }
  setUserName(userName: string) {
    this.userName = userName.toLowerCase();
  }
  getUserName(): string {
    return this.userName && this.userName.toLowerCase();
  }
  setPassword(password: string) {
    this.password = password;
  }
  getPassword(): string {
    return this.password;
  }
  ionViewWillEnter() {
    setTimeout(() => this.userData.getPassword().then(password => {
      this.userData.getUsername().then(userName => {
        if (!userName) {
          this.presentAlert();
          return;
        }
        this.setUserName(userName);
        this.setPassword(password);
        let alreadyLoaded = false;
        this.todoService.getRatings().subscribe(ratings => {
          this.allUsers = ratings;
          this.userData.isAdmin().then(isAdmin => {
            this.setAdmin(isAdmin);
          })
          if(!alreadyLoaded) {
            this.todos = this.sortCurrentUsersBooksByRating();
          }
        });
        this.todoService.getTodos().subscribe(bookList => {
          this.todos = bookList; 
          this.todos.forEach(book => {
            if(this.getRatingsOfCurrentUser() && !this.getRatingsOfCurrentUser().ratings
            .find((ratedBook) => book.id === ratedBook.bookId) ) {
              this.getRatingsOfCurrentUser().ratings.push({
                bookId: book.id,
                bookName: book.task,
                rank: book.priority,
              })
            }
          })
          if(!alreadyLoaded) {
            this.todos = this.sortCurrentUsersBooksByRating();
            alreadyLoaded = true;
          }
        });
      });
      this.todoService.getOpaVotePollStatuses().subscribe(pollStatuses => {
        this.isOpaVotePollOpen = pollStatuses[0] && pollStatuses[0].status;
        this.isOpaVotePollOpen = this.isOpaVotePollOpen === undefined ? this.isOpaVotePollOpen = true : this.isOpaVotePollOpen;
        this.opaVotePollId = (pollStatuses[0] && pollStatuses[0].id) || '';
        this.opaVotePollWinner = pollStatuses[0].winner;
      })
      
    }), 500)
  }
  sortCurrentUsersBooksByRating() {
    if (!this.allUsers || !this.todos) {
      return this.todos;
    }
    const currentUsersInfo = this.allUsers
    .find( userRating => userRating.userName === this.getUserName());
    if (!currentUsersInfo) {
      return this.todos;
    }
    return this.todos.sort((currentBook, nextBook) => 
      currentUsersInfo.ratings.find(a => a.bookId === currentBook.id).rank 
      - currentUsersInfo.ratings.find(a => a.bookId === nextBook.id).rank);
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
  vote(item) {
    this.remove(item);
    this.todos = this.todos.filter(todo => todo.id !== item);
  }
  remove(item) {
    this.todoService.removeTodo(item.id);
  }
  submitVotes() {
    this.opaVoteService.submitVotes(this.todos, this.allUsers)
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
        this.todoService.updateOpaVotePollStatus({winner: response.winners[0], status: false, id: this.opaVotePollId}, this.opaVotePollId);
        
      });
  }
  getItems() {
    this.opaVoteService.getItems();
  }
  setAdmin(isAdmin: boolean) {
    this.isAdmin = isAdmin;
  }
  reopenPoll() {
    this.todoService.updateOpaVotePollStatus({status: true, id: this.opaVotePollId}, this.opaVotePollId);
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
}
