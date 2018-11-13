import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from '@/_models';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    get() {
        return this.http.get<User>(`${config.apiUrl}/user`);
    }

    update(user: User) {
        return this.http.put<User>(`${config.apiUrl}/user`, user);
    }

    register(user: User) {
        debugger;
        return this.http.post(`${config.apiUrl}/user/register`, user);
    }

    sessionCreate(email: string, password: string) {
        return this.http.post(
            `${config.apiUrl}/user/session/create`,
            {
                email,
                password
            }
        );
    }

    sessionRenew() {
        return this.http.put(`${config.apiUrl}/user/session/renew`, {});
    }

    resetPassword(email: string) {
        return this.http.put(`${config.apiUrl}/user/resetPassword`, email);
    }
}