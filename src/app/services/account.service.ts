import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { Result } from '../models/result';


@Injectable({ providedIn: 'root' })
export class AccountService {
  protected basePath = environment.apiRoot;

  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.userSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('user')!));
    this.user = this.userSubject.asObservable();
  }

  public get userValue() {
    return this.userSubject.value;
  }

  login(email: string, password: string): Observable<Result<any>> {
    return this.http.post<Result<any>>(`${environment.apiRoot}/authenticate/signin`, { email: email, password })
      .pipe(map(ret => {
        if (ret.successful) {
          let user = ret.content;
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        } else {
          console.log('error ' + ret.message);
        }
        return ret;
      }));
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['']);
  }

  register(user: User): Observable<Result<any>> {
    return this.http.post<Result<any>>(`${environment.apiRoot}/authenticate/signup`, user);
  }

  getAll() {
    return this.http.get<User[]>(`${environment.apiRoot}/users`);
  }

  getById(id: string) {
    return this.http.get<User>(`${environment.apiRoot}/users/${id}`);
  }

  update(id: string, params: any) {
    return this.http.put(`${environment.apiRoot}/users/${id}`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        if (id == '' + this.userValue?.id) {
          // update local storage
          const user = { ...this.userValue, ...params };
          localStorage.setItem('user', JSON.stringify(user));

          // publish updated user to subscribers
          this.userSubject.next(user);
        }
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiRoot}/users/${id}`)
      .pipe(map(x => {
        // auto logout if the logged in user deleted their own record
        if (id == '' + this.userValue?.id) {
          this.logout();
        }
        return x;
      }));
  }

  forgotPassword(email: string, password: string): Observable<Result<any>> {
    return this.http.post<Result<any>>(`${environment.apiRoot}/authenticate/forgot-password`, { email: email, password: password });
  }

  resetPassword(token: string, password: string): Observable<Result<any>> {
    return this.http.post<Result<any>>(`${environment.apiRoot}/authenticate/change-password`, { token: token, password: password });
  }
}
