import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '@/_models';
import { AlertService, UserService, AuthenticationService } from '@/_services';

@Component({ templateUrl: 'profile.component.html' })
export class ProfileComponent implements OnInit, OnDestroy {
    profileForm: FormGroup;
    user = JSON.parse(localStorage.getItem('user'));
    //token: Token;
    tokenSubscription: Subscription;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private alertService: AlertService
    ) {
        if (!this.authenticationService.currentTokenValue) { 
            this.router.navigate(['/login']);
        }
    }

    ngOnInit() {
        this.profileForm = this.formBuilder.group({
            name: [ this.user.name, Validators.required],
            email: [ this.user.email, Validators.email]
        });
        this.getUserInfo();
    }

    ngOnDestroy() {
    }

    get f() {
        return this.profileForm.controls;
    }

    onSubmit() {
        this.submitted = true;

        if (this.profileForm.invalid) {
            return;
        }

        this.loading = true;
        this.userService.update(this.profileForm.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Registration successful', true);
                    this.router.navigate(['/login']);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }

    private getUserInfo() {
        this.userService.get().subscribe(user => {
            this.user = user;
        });
    }
}