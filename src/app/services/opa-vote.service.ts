import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Book, UserRatings } from './book.service';
import { prepareEventListenerParameters } from '@angular/compiler/src/render3/view/template';
import { map } from 'rxjs/operators';
import { stringify } from '@angular/compiler/src/util';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OpaVoteService {
  private openVoteResponse: {};
  corsProxyUrl = 'https://cors-anywhere.herokuapp.com';
  opaVoteBaseUrl = 'https://www.opavote.com/api/v1';
  opaVoteSanityEndpoint = 'me';
  opaVoteCountsEndpoint = 'counts';
  opaVoteItemsEndpoint = 'items';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': 'Ngdm5Zv3QUqhUPSBuicGfQ'
    })
  };
  constructor(public httpClient: HttpClient) {
    
  }
  submitVotes(books: Book[], userRatings: UserRatings[]) {
    const mapBookIdsToOpaVoteIds = books
    .map((book, index) => ({
      bookId: book.id, 
      opaVoteId: '' + (index + 1)
    }))
    .reduce((previousValue, currentValue) => {
      previousValue[currentValue.bookId] = currentValue.opaVoteId;
      return previousValue;
    }, {});
    return this.httpClient
    .post(
      `${this.corsProxyUrl}/${this.opaVoteBaseUrl}/${this.opaVoteCountsEndpoint}`,
        { 'method': 'Borda Count', 'blt': 
          // 4 2
          `${books.length} 1\n`
          // 1 4 1 3 2 0
          + userRatings
          .map(userRating => userRating.ratings)
          .map(ratings => 
            ratings.sort((a, b) => a.rank - b.rank)
            .reduce((previousValue, currentValue) => {
              const opaId = mapBookIdsToOpaVoteIds[currentValue.bookId];
              if(opaId === undefined) { return previousValue };
              return previousValue + ` ${opaId}`;
            }, '1')
          ).join(' 0\n') + ' 0\n'
          // 0
          + '0\n'
          // "Candidate 1"
          + '\"'
          + books.map(book => book.task)
          .reduce((previousValue, currentValue) => {
            return previousValue + '\"' + '\n\"' + currentValue;
          }) + '\"' + '\n'
          // "Title"
          + '\"Book Vote for December\"' },
        this.httpOptions)
  }
  getItems() {
    this.httpClient
    .get(
      `${this.corsProxyUrl}/${this.opaVoteBaseUrl}/${this.opaVoteItemsEndpoint}`,
      this.httpOptions)
    .subscribe(response => {
      console.log(response);
    });
  }
  sanityCheck(books: Book[]) {
    this.httpClient
    //.get('https://www.opavote.com/api/v1/me')
    .get(`${this.corsProxyUrl}/${this.opaVoteBaseUrl}/${this.opaVoteSanityEndpoint}`, this.httpOptions)
    .subscribe(data => {
      this.openVoteResponse = { data }
      console.info(data);
    });
  }

}