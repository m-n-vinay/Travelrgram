import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  constructor(private toastr: ToastrService, private auth:AuthService,
    private router: Router) { }

  ngOnInit(): void {
  }

  onSubmit(f: NgForm){
    const {email, password} = f.form.value;

    this.auth.signIn(email, password)
    .then((result)=>{
      this.toastr.success("Sign In success");
      this.router.navigateByUrl("/");
    })
    .catch((e)=>{
      this.toastr.error(e.message,'',{
        closeButton: true,
      });
    })
  }
}
