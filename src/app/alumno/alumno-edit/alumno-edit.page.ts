import { Component, OnInit, inject } from '@angular/core';
import { collection, addDoc, updateDoc, Firestore, doc, getDoc, deleteDoc, setDoc } 
from '@angular/fire/firestore';
import { Storage, StorageError, UploadTaskSnapshot, ref, 
  uploadBytesResumable, getBlob, list,
  getDownloadURL,  } from '@angular/fire/storage';

import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-alumno-edit',
  templateUrl: './alumno-edit.page.html',
  styleUrls: ['./alumno-edit.page.scss'],
})
export class AlumnoEditPage implements OnInit {
  id: any;
  isNew : boolean = false;

  avatar : string = '';
  //alumno : any = {};
  private storage: Storage = inject(Storage);

  
  constructor(
    private readonly firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    
  ) { }

  ngOnInit() {
    //this.incluirAlumno();
    //this.editarAlumno("FcoZmWssJ6p9Oh5oIpBD");
    this.route.params.subscribe((params:any) => {
        console.log("params", params); 
        this.id = params.id;

        this.isNew = this.id == 'new';

        this.obtenerAlumno(this.id);
        //this.obtenerAvatarAlumno(this.id);
        
    });
  }

  incluirAlumnoSet = () => {
    console.log("Aqui incluir en firebase");
    
    const id = this.generateId();
    const document = doc(this.firestore, "alumno", id);

    setDoc(document, {
      codigo : this.alumno.codigo,
      nombre : this.alumno.nombre,
      apellido : this.alumno.apellido, 
      ...this.triGram([this.alumno.nombre || '', this.alumno.apellido || ''].join(' ').slice(0, 500))
    }).then(doc => {
      console.log("Registro Incluido");
      this.router.navigate(['/alumno-list']);
    });
    
  }
  incluirAlumno = () => {
    console.log("Aqui incluir en firebase");

    let alumnosRef = collection(this.firestore, "alumno");
    addDoc(alumnosRef, {
      codigo : this.alumno.codigo,
      nombre : this.alumno.nombre,
      apellido : this.alumno.apellido,
    }).then(doc => {
      console.log("Registro Incluido", doc);
      this.router.navigate(['/alumno-list']);

      //Aqui actualizar la imagen en el firebase que se habra quedado como new
      console.log(doc.id);
      this.editarNombreAvatar();
    });
  }

  editarAlumno = () => {
    console.log("Aqui editar en firebase");
    const document = doc(this.firestore, "alumno", this.id);

    updateDoc(document, {
      codigo : this.alumno.codigo,
      nombre : this.alumno.nombre,
      apellido : this.alumno.apellido
    }).then(doc => {
      console.log("Registro Editado");

      this.router.navigate(['/alumno-list']);
    });
  }

  editarAvatar = () => {
    console.log("Aqui editar el avatar en firebase");
    const document = doc(this.firestore, "alumno", this.id);

    if (this.id != "new") {
      updateDoc(document, {
        avatar : 'avatars/alumno/' + this.id
      }).then(doc => {
        console.log("Avatar Editado");
      });
    }
  }

  editarNombreAvatar = () => {
    console.log("Aqui renombrar el avatar de NEW al codigo");
    //var storageRef = firebase.storage().ref();
    const storageRef = ref(this.storage, `avatars/alumno/new`);
    //const storageRef = ref(this.storage, `avatars/alumno/${this.id}`);

  }

  alumno : any = {};
  obtenerAlumno = (id: string) => {
    const document = doc(this.firestore, "alumno", id);
    getDoc(document).then(doc => {
      console.log("Registro a editar", doc.data());

      if (doc.data()) {
        this.alumno = doc.data();

        if (this.alumno.avatar) {
          this.obtenerAvatarAlumno();
        }
      } else {
        this.alumno = {};
      }
    });
  }


  guardarAlumno = () => {

    if (this.isNew) {
      this.incluirAlumno();
    } else {
      this.editarAlumno();
    }
    
    
  }

  borrarAlumno = (id: string) => {
    const document = doc(this.firestore, "alumno", id);
    deleteDoc(document).then(doc => {
      console.log("Documento eliminado", id);
      this.router.navigate(['/alumno-list']);

      
    });
  }

  onUploadChange = (response:UploadTaskSnapshot) => {
    console.log('onUploadChange', response);
  }
  onUploadError = (error: StorageError) => {
    console.log('onUploadError', error);
  }
  onUploadComplete = () => {
    console.log('upload completo');
    this.editarAvatar();
    this.obtenerAvatarAlumno();

  }

  uploadFile = (input: HTMLInputElement) => {
    if (!input.files) return

    const files: FileList = input.files;

    for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file) {
          console.log(file, file.name);
          const storageRef = ref(this.storage, `avatars/alumno/${this.id}`);
          //const storageRef = ref(this.storage, file.name);
          uploadBytesResumable(storageRef, file).on(
            'state_changed',
            this.onUploadChange,
            this.onUploadError,
            this.onUploadComplete,
          );
        }
    }
  }

  obtenerAvatarAlumno = () => {
    const storageRef = ref(this.storage, `avatars/alumno/${this.id}`);
    console.log("buscar", storageRef);
    copyO(storageRef).then(doc => {
      console.log("Avatar a mostrar", doc);
      this.avatar = doc;
    });
  }
  obtenerAvatarAlumno3= (id: string) => {
    const storageRef = ref(this.storage, `avatars/alumno/${this.id}`);
    console.log("buscar", storageRef);
    list(storageRef).then(doc => {
      console.log("Avatar a mostrar", doc);

    });
  }

  obtenerAvatarAlumno2 = (id: string) => {
    const storageRef = ref(this.storage, `avatars/alumno/${this.id}`);
    console.log("buscar", storageRef);
    getBlob(storageRef).then(doc => {
      console.log("Avatar a mostrar", doc);

    });
  }

  GENERATION_OFFSET = new Date('5000-01-01').getTime();
  generateId = () => {
    
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    // Add some randomness to avoid data clashes.
    // If records come in that close, I don't care which one shows first, otherwise I 
    // will have to make sure the randomness is ordered correctly.
    for (let i = 0; i < 10; i++) {
      autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return (this.GENERATION_OFFSET - Date.now()).toString(32) + autoId;
  };

  triGram = (txt:string) => {
    const map : any = {};
    const s1 = (txt || '').toLowerCase();
    const n = 3;
    for (let k = 0; k <= s1.length - n; k++) map[s1.substring(k, k + n)] = true;
    return map;
  };
}
