import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { imageConfig } from 'src/utils/config';
import { readAndCompressImage } from 'browser-image-resizer';
import { NgxImageCompressService } from 'ngx-image-compress';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.css'],
})
export class AddpostComponent implements OnInit {
  locationName: string = '';
  description: string = '';
  picture: string | null = null;

  user: any = null;
  uploadPercent: number | null = null;

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
    private auth: AuthService,
    private route: Router,
    private imageCompress: NgxImageCompressService
  ) {
    auth.getUser().subscribe((user) => {
      this.db
        .object(`/users/${user?.uid}`)
        .valueChanges()
        .subscribe((user) => {
          this.user = user;
        });
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    const uid = uuidv4();

    this.db
      .object(`/posts/${uid}`)
      .set({
        id: uid,
        locationName: this.locationName,
        description: this.description,
        picture: this.picture,
        by: this.user.name,
        instaId: this.user.instaUserName,
        date: Date.now(),
      })
      .then(() => {
        this.toastr.success('Post Added SuccessFully');
        this.route.navigateByUrl('/');
      })
      .catch((e) => {
        this.toastr.error('Error, something wrong');
        console.log(e);
      });
  }

  async uploadFile(event: any) {
    const file = event.target.files[0];

    let resizedImage = await readAndCompressImage(file, imageConfig);

    const filePath= uuidv4();
    const fileRef = this.storage.ref(filePath);

    const task = this.storage.upload(filePath, resizedImage);

    task.percentageChanges().subscribe((percentage)=>{
      this.uploadPercent = percentage!;
    });

    task.snapshotChanges().pipe(
      finalize(()=>{
        fileRef.getDownloadURL().subscribe((url)=>{
          this.picture = url;
          this.toastr.success('Image upload success');
        })
      })
    ).subscribe();

  }
}
