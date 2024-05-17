import { Component, OnInit } from '@angular/core';
import { collection, collectionData, Firestore, getDocs, 
  query, startAt, startAfter, orderBy, where, limit, FieldPath, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-alumno-list',
  templateUrl: './alumno-list.page.html',
  styleUrls: ['./alumno-list.page.scss'],
})
export class AlumnoListPage implements OnInit {

  constructor(private readonly firestore: Firestore) { }
  isSearch : boolean = false;
  query = "";
  lastVisible : any ;
  li = 10;
  listaAlumnos = new Array();
  //listaAlumnos = [];

  ngOnInit() {
    console.log("ngOnInit");
    this.listaAlumnos = new Array();
    this.lastVisible = null ;
    this.listarAlumnos();
  }
  ionViewWillEnter(){
    console.log("ion will enter..");
    this.listaAlumnos = new Array();
    this.lastVisible = null ;
    this.listarAlumnos();
  }
  triGram = (txt:string) => {
    const map : any = {};
    const s1 = (txt || '').toLowerCase();
    const n = 3;
    for (let k = 0; k <= s1.length - n; k++) map[s1.substring(k, k + n)] = true;
    return map;
  };


  listarAlumnosTriGram = () => {
    console.log("listar alumnos");
    const alumnosRef = collection(this.firestore, "alumno");

    if ((this.query+"").length > 0) {

      let q: any = undefined;
        q = query(alumnosRef, 
            //where("nombre", ">=", this.query.toUpperCase()), 
            //where("nombre", "<=", this.query.toLowerCase() + '\uf8ff'), 
            limit(this.li), 
            //startAfter(this.lastVisible)
            );

      const searchConstraints : any[] = [];
      console.log(this.triGram(this.query));
      this.triGram(this.query).forEach((name: string) =>
          q.where(`_smeta.${name}`, '==', true));
      //);

      let constraints = [
        alumnosRef,
        //where('postType', '==', 'altfuel'),
        //where('visibility', '==', 'public'),
        ...searchConstraints,
        limit(this.li)
      ];

      //const q = query.apply(this, constraints);

      getDocs(q).then(re => {

        if (!re.empty){
          this.lastVisible = re.docs[re.docs.length-1];
  
          re.forEach(doc => {
            console.log("queryyyy", doc.id, "data", doc.data());
            let alumno : any= doc.data();
            alumno.id = doc.id;
            this.listaAlumnos.push(alumno);
          });
        }
        

      });
    } else {
      this.listarAlumnosSinFiltro();
    }
  }
  listarAlumnos = () => {
    console.log("listar alumnos");
    const alumnosRef = collection(this.firestore, "alumno");

    if ((this.query+"").length > 0) {
      let q = undefined;
      if (this.lastVisible) {
        q = query(alumnosRef, 
            where("nombre", ">=", this.query.toUpperCase()), 
            where("nombre", "<=", this.query.toLowerCase() + '\uf8ff'), 
            limit(this.li), 
            startAfter(this.lastVisible));

      } else {
        q = query(alumnosRef, where("nombre", ">=", this.query.toUpperCase()), 
          where("nombre", "<=", this.query.toLowerCase() + '\uf8ff'), 
          limit(this.li));
      }
      getDocs(q).then(re => {

        if (!re.empty){
          let nuevoArray = new Array();

          //Retirar lo que no corresponde
          for (let i = 0; i < re.docs.length; i++) {
            const doc : any = re.docs[i].data();
            if (doc.nombre.toUpperCase().startsWith(this.query.toUpperCase().charAt(0))) {
              nuevoArray.push(re.docs[i])
            }
          }

          this.lastVisible = re.docs[nuevoArray.length-1];
  
          for (let i = 0; i < nuevoArray.length; i++) {
            const doc : any = nuevoArray[i];
            //console.log("queryyyy", doc.id, "data", doc.data());
            let alumno : any= doc.data();
            alumno.id = doc.id;
            this.listaAlumnos.push(alumno);
          };
        }
        

      });
    } else {
      this.listarAlumnosSinFiltro();
    }
  }

  listarAlumnosSinPaginacionConFiltro = () => {
    console.log("listar alumnos");
    const alumnosRef = collection(this.firestore, "alumno");

    if ((this.query+"").length > 0) {
      const q = query(alumnosRef, where("nombre", ">=", this.query), where("nombre", "<=", this.query + '\uf8ff'), startAt(10));
      getDocs(q).then(re => {
        re.forEach(doc => {
          console.log("queryyyy", doc.id, "data", doc.data());
          let alumno : any= doc.data();
          alumno.id = doc.id;
          this.listaAlumnos.push(alumno);
        });

      });
    } else {
      this.listarAlumnosSinFiltro();
    }
  }
  listarAlumnosSinFiltro = () => {
    console.log("listar alumnos");
    const alumnosRef = collection(this.firestore, "alumno");

    let q = undefined;
    if (this.lastVisible) {
      q = query(alumnosRef,  limit(this.li), startAfter(this.lastVisible));

      console.log(this.lastVisible);
    } else {
      q = query(alumnosRef,  limit(this.li));
    }

    const querySnapshot =  getDocs(q).then(re => {
      if (!re.empty) {
     
        this.lastVisible = re.docs[re.docs.length-1];

        re.forEach(doc => {
          //console.log("queryyyy", doc.id, "data", doc.data());
          let alumno : any= doc.data();
          alumno.id = doc.id;
          this.listaAlumnos.push(alumno);
        });
      }
    });
  }
  listarAlumnos0 = () => {
    console.log("listar alumnos");
    const alumnosRef = collection(this.firestore, "alumno");
    collectionData(alumnosRef, { idField: 'id', }, ).subscribe(respuesta=>{
      console.log("estos son los alumnos", respuesta);

      respuesta.forEach(element => this.listaAlumnos.push(element));
      
    });
  }
  clickSearch = () => {
    this.isSearch = true;
  }

  cancelSearch = () => {
    this.isSearch = false;
  }

  clearSearch = () => {
    this.isSearch = false;
    this.query = "";
    
    this.listaAlumnos = new Array();
    this.lastVisible = null;

    this.listarAlumnos();
  }
  
  buscarSearch = (e:any) => {
    this.isSearch = false;
    this.query = e.target.value;
    
    this.listaAlumnos = new Array();
    this.lastVisible = null;
    this.listarAlumnos();
    //console.log(e.target.value);
  }

  onIonInfinite(ev: any) {
    //this.generateItems();
    this.listarAlumnos();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }


}
