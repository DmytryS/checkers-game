import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Token } from '@/_models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private tokenSubject: BehaviorSubject<Token>;
    public token: Observable<Token>;

    constructor(private http: HttpClient) {
        this.tokenSubject = new BehaviorSubject<Token>(JSON.parse(localStorage.getItem('token')));
        this.token = this.tokenSubject.asObservable();
    }

    public get currentTokenValue(): Token {
        return this.tokenSubject.value;
    }

    login(email: string, password: string) {
        return this.http.post<any>(`${config.apiUrl}/user/session/create`, { email, password })
            .pipe(map(token => {
                if (token) {
                    debugger;
                    localStorage.setItem('token', JSON.stringify(token));
                    this.tokenSubject.next(token);
                }

                return token;
            }));
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.tokenSubject.next(null);
    }
}