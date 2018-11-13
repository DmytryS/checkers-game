import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Game } from '@/_models';

@Injectable({ providedIn: 'root' })
export class GameService {
    constructor(private http: HttpClient) { }

    getAll(token: string) {
        return this.http.get(`${config.apiUrl}/games`);
    }

    joinOrCreate(token: string) {
        return this.http.post(
            `${config.apiUrl}/games`,
            {},
            {
                headers: new HttpHeaders({
                    'Authorization': token
                })
            }
        );
    }
}