import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@/_models';

@Injectable({ providedIn: 'root' })
export class UserService {
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;

    constructor(private http: HttpClient) {
        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    get() {
        return this.http.get<User>(`${config.apiUrl}/user`)
            .pipe(map(user => {
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                    this.userSubject.next(user);
                }

                return user;
            }));
    }

    public get currentUserValue(): User {
        return this.userSubject.value;
    }

    update(user: User) {
        return this.http.put<User>(`${config.apiUrl}/user`, user);
    }

    register(user: User) {
        return this.http.post(`${config.apiUrl}/user/register`, user, { responseType: 'text' });
    }

    sessionRenew() {
        return this.http.put(`${config.apiUrl}/user/session/renew`, {});
    }

    resetPassword(email: string) {
        return this.http.put(`${config.apiUrl}/user/resetPassword`, email);
    }
}