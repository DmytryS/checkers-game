import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { User } from '@/_models';
import { UserService, AuthenticationService } from '@/_services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit, OnDestroy {
    user: User;
    userSubscription: Subscription;

    constructor(
        private authenticationService: AuthenticationService,
        private userService: UserService
    ) {
        this.userSubscription = this.authenticationService.user.subscribe(user => {
            this.user = user;
        });
    }

    ngOnInit() {
        this.getUserInfo();
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.userSubscription.unsubscribe();
    }

    updateUser(user: User) {
        this.userService.update(user).pipe(first()).subscribe(() => {
            //this.loadAllUsers()
        });
    }

    private getUserInfo() {
        this.userService.get().pipe(first()).subscribe(user => {
            this.user = user;
        });
    }
}