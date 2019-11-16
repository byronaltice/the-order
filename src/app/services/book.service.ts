import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'firebase';
import { HttpClient } from '@angular/common/http';
import { RouteView } from '@ionic/angular/dist/directives/navigation/stack-utils';

export interface Book {
  description: string;
  author: string;
  id?: string;
  task: string;
  priority: number;
  createdAt: number;
  user: string;
}
export interface PollStatus {
  id?: string;
  status: boolean;
  winner: string;
}
export interface Rating {
  bookId: string;
  bookName: string;
  rank?: number;
}
export interface Review {
  overall: number;
  characters: number;
  setting: number;
  plot: number;
  themes: number;
}
export interface UserRatings {
  id?: string;
  userName: string;
  password: string;
  ratings: Rating[];
  review: Review;
}
@Injectable({
  providedIn: 'root'
})
export class BookService {
  private booksCollection: AngularFirestoreCollection<Book>;
  private userRatingsCollection: AngularFirestoreCollection<UserRatings>;
  private opaVotePollStatusCollection: AngularFirestoreCollection<PollStatus>;

  private books: Observable<Book[]>;
  private opaVotePollStatus: Observable<PollStatus[]>;
  private ratings: Observable<UserRatings[]>;
 
  constructor(db: AngularFirestore, public httpClient: HttpClient) {
    this.booksCollection = db.collection<Book>('books');
    this.books = this.booksCollection.snapshotChanges().pipe(
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
  getBooks() {
    return this.books;
  }
 
  getBook(id) {
    return this.booksCollection.doc<Book>(id).valueChanges();
  }
 
  updateBook(book: Book, id: string) {
    return this.booksCollection.doc(id).update(book);
  }
 
  addBook(book: Book, userName: String) {
    return this.booksCollection.add(book);
  }
 
  removeBook(id) {
    return this.booksCollection.doc(id).delete();
  }

  getRatings() {
    return this.ratings;
  }
  updateRatings(userRatings: UserRatings) {
    userRatings.userName = userRatings.userName.toLowerCase();
    return this.userRatingsCollection.doc(userRatings.id).update(userRatings)
  }
  deleteRatings(allUserRatings: UserRatings[]) {
    const allUserRatingsCleared = allUserRatings
    .map( user => {
      user.ratings = [];
      return user;
    });
    allUserRatings.filter(() => true);
    allUserRatingsCleared.forEach(user => {
      this.updateRatings(user);
    });
  }
  addRatings(userRatings: UserRatings) {
    userRatings.userName = userRatings.userName.toLowerCase();
    return this.userRatingsCollection.add(userRatings);
  }
}
