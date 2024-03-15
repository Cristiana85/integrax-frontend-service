import { Injectable } from '@angular/core';
import { Project } from '../models/project';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {

  lProject: Project[];
  //lTemplate: Template[];

  constructor() { }


  setlProject(lProjectDB: Project[]){
    this.lProject = lProjectDB;
  }

  getlProject(){
    return this.lProject;
  }
}
