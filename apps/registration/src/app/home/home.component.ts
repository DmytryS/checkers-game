import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { User } from '@/_models';
import { UserService, AuthenticationService } from '@/_services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit, OnDestroy {
    user: User;
    currentUserSubscription: Subscription;

    constructor(
        private authenticationService: AuthenticationService,
        private userService: UserService
    ) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.user = user;
        });
    }

    ngOnInit(token: string) {
        this.getUserInfo(token);
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.currentUserSubscription.unsubscribe();
    }

    updateUser(token: string, user: User) {
        this.userService.update(token, user).pipe(first()).subscribe(() => {
            //this.loadAllUsers()
        });
    }

    private getUserInfo(token: string) {
        this.userService.get(token).pipe(first()).subscribe(user => {
            this.user = user;
        });
    }
}