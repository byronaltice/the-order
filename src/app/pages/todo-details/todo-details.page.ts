import { Todo, TodoService } from './../../services/todo.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController } from '@ionic/angular';
import { UserData } from '../../providers/user-data';
 
@Component({
  selector: 'app-todo-details',
  templateUrl: './todo-details.page.html',
  styleUrls: ['./todo-details.page.scss'],
})
export class TodoDetailsPage implements OnInit {
 
  todo: Todo = {
    task: '',
    createdAt: new Date().getTime(),
    priority: 2,
    user:  '',
  };
  userName: string;
 
  todoId = null;
 
  constructor(private userData: UserData, private route: ActivatedRoute, private nav: NavController, private todoService: TodoService, private loadingController: LoadingController) { }
 
  ngOnInit() {
    this.todoId = this.route.snapshot.params['id'];
    if (this.todoId)  {
      this.loadTodo();
    }
  }
  ionViewWillEnter() {
    this.userData.getUsername().then(userName => {
      this.todo.user = userName;
    })
  }
 
  async loadTodo() {
    const loading = await this.loadingController.create({
      message: 'Loading Todo..'
    });
    await loading.present();
 
    this.todoService.getTodo(this.todoId).subscribe(res => {
      loading.dismiss();
      this.todo = res;
    });
  }
 
  async saveTodo() {
 
    const loading = await this.loadingController.create({
      message: 'Saving Todo..'
    });
    await loading.present();
 
    if (this.todoId) {
      this.todoService.updateTodo(this.todo, this.todoId).then(() => {
        loading.dismiss();
        //this.nav.back('home');
      });
    } else {
      this.todoService.addTodo(this.todo, this.userName).then(() => {
        loading.dismiss();
        //this.nav.back('home');
      });
    }
  }
 
}
