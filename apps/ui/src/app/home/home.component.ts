import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, Token } from '@/_models';
import { UserService, AuthenticationService } from '@/_services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit {
    user = new User();

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService
    ) {
        if (!this.authenticationService.currentTokenValue) { 
            this.router.navigate(['/login']);
        }
    }

    ngOnInit() {
        this.getUserInfo();
    }

    private getUserInfo() {
        this.userService.get().subscribe(user => {
            this.user = user;
        });
    }
}