import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { Action } from '@/_models';
import { AlertService, ActionService } from '@/_services';
import { PasswordValidation } from '../_helpers';

@Component({templateUrl: 'action.component.html'})
export class ActionComponent implements OnInit {
    actionForm: FormGroup;
    action: Action;
    id: string;
    paramSubscription: Subscription;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private actionService: ActionService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.actionForm = this.formBuilder.group({
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required]
        }, {
            validator: PasswordValidation.MatchPassword
        });

        this.paramSubscription = this.route.params.subscribe(params => {
            this.id = params['id'];
        });
        this.getActon();
    }

    ngOnDestroy() {
        this.paramSubscription.unsubscribe();
      }

    private getActon() {    
        this.actionService.get(this.id).pipe(first()).subscribe(action => {
            this.action = action;
        });
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.actionForm.controls;
    }

    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.actionForm.invalid) {
            return;
        }

        this.loading = true;
        
        this.actionService.submit(this.id, this.actionForm.value.password)
            .pipe(first())
            .subscribe(
                data => {
                    console.log(data);
                    debugger;
                    this.alertService.success('Registration successful 111', true);
                    this.router.navigate(['/login']);
                },
                error => {
                    debugger;
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
