import { Injectable } from '@angular/core';
import { Hero } from './hero';
import { HEROES } from './mock-heroes';
import { Observable, of, from } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders, HttpHeaderResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  private heroesUrl = "api/heroes";
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }

  constructor(private messageService: MessageService, private http: HttpClient) { }

  getHeroes(): Observable<Hero[]> {
    this.log("HeroService getHeroes");
    return this.http.get<Hero[]>(this.heroesUrl).pipe(
      tap(_ => this.log("fetched heroes")),
      catchError(this.handleError<Hero[]>('get heroes', []))
    );
  }

  getHero(id: number): Observable<Hero> {
    this.log(`HeroService getHero id=${id}`);
    return this.http.get<Hero>(this.heroesUrl + `/${id}`);
  }

  updateHero(hero: Hero): Observable<any> {
    this.log(`updateHero id=${hero.id}`);
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('update hero'))
    );
  }

  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero id=${newHero.id}`)),
      catchError(this.handleError<Hero>(`add hero`))
    );
  }

  deleteHero(hero: Hero | number): Observable<any> {
    const id = typeof hero === 'number' ? hero : hero.id;
    return this.http.delete(`${this.heroesUrl}/${id}`).pipe(
      tap(_ => this.log(`delete hero id=${id}`)),
      catchError(this.handleError(`delete hero`))
    );
  }

  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(x => x.length ? this.log(`found ${x.length} heroes matching ${term}`) : this.log(`found nothing with term ${term}`)),
      catchError(this.handleError<Hero[]>("search heroes", []))
    );
  }

  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
