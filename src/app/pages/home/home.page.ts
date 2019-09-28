import { Component, OnInit } from '@angular/core';
import { Todo, TodoService, UserRatings as UserInfo } from '../../services/todo.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserData } from '../../providers/user-data';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  todos: Todo[];
  userName: string;
  allUsers: UserInfo[];

  constructor(
    private todoService: TodoService,
    private userData: UserData,
    private alertController: AlertController,
    private router: Router
  ) { }

  onRenderItems(event) {
    let draggedItem = this.todos.splice(event.detail.from, 1)[0];
    const ratingsOfCurrentUser = this.allUsers.find(rating => rating.userName === this.userName);
    this.todos.splice(event.detail.to, 0, draggedItem);
    event.detail.complete();
    const newRankingsForThisUser = [{ bookId: '', rank: 0, bookName: '' }];
    this.todos.forEach((book, rank) => {
      newRankingsForThisUser[rank] = { bookId: book.id, rank, bookName: book.task };
    });
    const userInfo: UserInfo = {
      userName: this.userName, 
      ratings: newRankingsForThisUser, 
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
  ionViewWillEnter() {
    setTimeout(() => this.userData.getUsername().then(userName => {
      console.log('username: ' + userName)
      if (!userName) {
        this.presentAlert();
      }
      this.userName = userName;
    }), 500)
    this.todoService.getTodos().subscribe(res => {
      this.todos = res;
    });
    this.todoService.getRatings().subscribe(ratings => {
      this.allUsers = ratings;
    });
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
  remove(item) {
    this.todoService.removeTodo(item.id);
  }
}
