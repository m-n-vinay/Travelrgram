import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import {finalize} from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { imageConfig } from 'src/utils/config';
import { readAndCompressImage } from 'browser-image-resizer';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  picture: string = "../../../assets/user.png";

  uploadPercent : number|null = null;
  constructor(private toastr: ToastrService, private route: Router, 
    private auth: AuthService, private db: AngularFireDatabase, private storage: AngularFireStorage
    ) { }

  ngOnInit(): void {
  }

  onSubmit(f: NgForm){
    const {email, password, username, country, bio, name} = f.form.value;

    this.auth.signUp(email, password)
    .then((res) => {
      //console.log(res);
      const {uid} = res.user!;

      this.db.object(`/users/${uid}`)
      .set({
        id: uid,
        name:name,
        email: email,
        instaUserName: username,
        country: country,
        bio: bio,
        picture: this.picture,
      })
    })
    .then(()=> {
      this.route.navigateByUrl('/');
      this.toastr.success("SignUp Success");
    })
    .catch((e)=>{
      this.toastr.error("Signup failed");
      console.log(e);
    })
  }

  async uploadFile(event: any){
    const file = event.target.files[0];

    let resizedImage = await readAndCompressImage(file, imageConfig);

    const filePath = uuidv4();
    const fileRef = this.storage.ref(filePath);

    const task = this.storage.upload(filePath, resizedImage);

    task.percentageChanges().subscribe((percentage)=>{
      this.uploadPercent = percentage!;
    });

    task.snapshotChanges().pipe(
      finalize(()=>{
        fileRef.getDownloadURL().subscribe((url)=>{
          this.picture = url;
          this.toastr.success('image upload success');
        })
      })
    ).subscribe();

  }



}
