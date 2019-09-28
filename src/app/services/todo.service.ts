import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'firebase';

export interface Todo {
  id?: string;
  task: string;
  priority: number;
  createdAt: number;
  user: string;
}
export interface Rating {
  bookId: string;
  bookName: string;
  rank?: number;
}
export interface UserRatings {
  id?: string;
  userName: string;
  ratings: Rating[];
}
@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todosCollection: AngularFirestoreCollection<Todo>;
  private userRatingsCollection: AngularFirestoreCollection<UserRatings>;
 
  private todos: Observable<Todo[]>;

  private ratings: Observable<UserRatings[]>;
 
  constructor(db: AngularFirestore) {
    this.todosCollection = db.collection<Todo>('todos');
    this.todos = this.todosCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
    this.userRatingsCollection = db.collection<UserRatings>('userRatings');
    this.ratings = this.userRatingsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      })
    )
  }
 
  getTodos() {
    return this.todos;
  }
 
  getTodo(id) {
    return this.todosCollection.doc<Todo>(id).valueChanges();
  }
 
  updateTodo(todo: Todo, id: string) {
    return this.todosCollection.doc(id).update(todo);
  }
 
  addTodo(todo: Todo, userName: String) {
    return this.todosCollection.add(todo);
  }
 
  removeTodo(id) {
    return this.todosCollection.doc(id).delete();
  }

  getRatings() {
    return this.ratings;
  }
  updateRatings(userRatings: UserRatings) {
    userRatings.userName = userRatings.userName.toLowerCase();
    return this.userRatingsCollection.doc(userRatings.id).update(userRatings)
  }
  addRatings(userRatings: UserRatings) {
    userRatings.userName = userRatings.userName.toLowerCase();
    return this.userRatingsCollection.add(userRatings);
  }
}
