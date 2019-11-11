import { Book, BookService } from '../../services/book.service';
import { NgForm } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { UserData } from '../../providers/user-data';
import { ToastButton, ToastOptions } from '@ionic/core';
 
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
 
  constructor(private userData: UserData, 
    private route: ActivatedRoute, 
    private nav: NavController, 
    private bookService: BookService, 
    private loadingController: LoadingController,
    private toastController: ToastController) { }
 
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
    if(form && !form.valid) {
      alert('Fix issues');
    }
    const loading = await this.loadingController.create({
      message: 'Saving Book..'
    });
    const toastOptions: ToastOptions = {
      header: 'Added a new book',
      position: 'top',
    };
    loading.present().then(async () => {
      if (this.bookId) {
        toastOptions.header = "Updated";
        const toast = await this.toastController.create(toastOptions);
        this.bookService.updateBook(this.book, this.bookId).then(() => {
          loading.dismiss();
          this.nav.navigateForward('home');
          toast.present();
        });
      } else {
        toastOptions.header = "Added";
        const toast = await this.toastController.create(toastOptions);
        this.bookService.addBook(this.book, this.userName).then(() => {
          loading.dismiss();
          this.nav.navigateForward('home');
          toast.present();
        });
      }
    });
  }
 
}
