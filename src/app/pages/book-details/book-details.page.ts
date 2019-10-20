import { Book, BookService } from '../../services/book.service';
import { NgForm } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController } from '@ionic/angular';
import { UserData } from '../../providers/user-data';
 
@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.page.html',
  styleUrls: ['./book-details.page.scss'],
})
export class BookDetailsPage implements OnInit {
 
  book: Book = {
    description: '',
    author: '',
    task: '',
    createdAt: new Date().getTime(),
    priority: 2,
    user:  '',
  };
  userName: string;
 
  bookId = null;
 
  constructor(private userData: UserData, private route: ActivatedRoute, private nav: NavController, private bookService: BookService, private loadingController: LoadingController) { }
 
  /**
   * test commit
   */
  ngOnInit() {
    this.bookId = this.route.snapshot.params['id'];
    if (this.bookId)  {
      this.loadBook();
    }
  }
  ionViewWillEnter() {
    this.userData.getUsername().then(userName => {
      this.book.user = userName;
    })
  }
 
  async loadBook() {
    const loading = await this.loadingController.create({
      message: 'Loading Book..'
    });
    await loading.present();
 
    this.bookService.getBook(this.bookId).subscribe(res => {
      loading.dismiss();
      this.book = res;
    });
  }
 
  async saveBook(form: NgForm) {
    if(!form.valid) {
      alert('Fix issues');
    }
    const loading = await this.loadingController.create({
      message: 'Saving Book..'
    });
    await loading.present();
    
    if (this.bookId) {
      this.bookService.updateBook(this.book, this.bookId).then(() => {
        loading.dismiss();
        this.nav.navigateForward('home');
      });
    } else {
      this.bookService.addBook(this.book, this.userName).then(() => {
        loading.dismiss();
        this.nav.navigateForward('home');
      });
    }
  }
 
}
