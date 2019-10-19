import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'firebase';
import { HttpClient } from '@angular/common/http';

export interface Todo {
  id?: string;
  task: string;
  priority: number;
  createdAt: number;
  user: string;
}
export interface PollStatus {
  id?: string;
  status: boolean;
}
export interface Rating {
  bookId: string;
  bookName: string;
  rank?: number;
}
export interface UserRatings {
  id?: string;
  userName: string;
  password: string;
  ratings: Rating[];
}
@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todosCollection: AngularFirestoreCollection<Todo>;
  private userRatingsCollection: AngularFirestoreCollection<UserRatings>;
  private opaVotePollStatusCollection: AngularFirestoreCollection<PollStatus>;

  private todos: Observable<Todo[]>;
  private opaVotePollStatus: Observable<PollStatus[]>;
  private ratings: Observable<UserRatings[]>;
 
  constructor(db: AngularFirestore, public httpClient: HttpClient) {
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
    this.userRatingsCollection = db .collection<UserRatings>('userRatings');
    this.ratings = this.userRatingsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      })
    )
    this.opaVotePollStatusCollection = db.collection<PollStatus>('pollStatus');
    this.opaVotePollStatus = this.opaVotePollStatusCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    )
  }
 
  getOpaVotePollStatuses() {
    return this.opaVotePollStatus;
  }
  getOpaVotePollStatus(id) {
    return this.opaVotePollStatusCollection.doc<PollStatus>(id).valueChanges();
  }
  updateOpaVotePollStatus(opaVotePollStatus: PollStatus, id: string) {
    return this.opaVotePollStatusCollection.doc(id).update(opaVotePollStatus);
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
