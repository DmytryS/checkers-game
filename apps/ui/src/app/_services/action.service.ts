import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Action } from '@/_models';

@Injectable({ providedIn: 'root' })
export class ActionService {
    constructor(private http: HttpClient) { }

    get(id: string) {
        return this.http.get<Action>(`${config.apiUrl}/actions/${id}`);
    }

    submit(id: string, data: object) {
        return this.http.put(`${config.apiUrl}/actions/${id}`, data, { responseType: 'text' });
    }
}