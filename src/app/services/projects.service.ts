import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from 'src/app/models/project';
import { environment } from 'src/environments/environment';
import { Handle } from '../models/handle';
import { Result } from '../models/result';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  protected basePath = environment.apiRoot;
  constructor(protected http: HttpClient) { }

  public getlProject(
    handle: Handle
  ): Observable<Result<[Project]>> {

    const path = this.basePath + '/projects';

    let headers = new HttpHeaders();
    // verify required parameter 'authorization' is not null or undefined
    if (handle === null || handle === undefined) {
      throw new Error(
        'Required parameter handle was null or undefined when calling getlProject.'
      );
    }

    if (handle !== undefined && handle !== null) {
      headers = headers.set('AccountId', String(handle.accountId));
      headers = headers.set('Authorization', 'Bearer ' + btoa(handle.token));
    }

    return this.http.get<Result<[Project]>>(path, {
      headers: headers,
    });
  }

  public editProject(
    authorization: string,
    project: Project
  ): Observable<Result<Project>> {
    if (project === null || project === undefined) {
      throw new Error(
        'Required parameter lCustomization was null or undefined when calling editProject.'
      );
    }

    if (authorization === null || authorization === undefined) {
      throw new Error(
        'Required parameter authorization was null or undefined when calling editProject.'
      );
    }

    let headers = new HttpHeaders();
    if (authorization !== undefined && authorization !== null) {
      headers = headers.set('Authorization', 'Bearer ' + btoa(authorization));
    }

    return this.http.put<Result<Project>>(
      `${this.basePath}/projects/edit`,
      project,
      {
        headers: headers,
      }
    );
  }

  public deletelProject(
    handle: Handle,
    lProject: Array<Project>
  ): Observable<Result<void>> {
    const path = this.basePath + '/projects';

    if (handle === null || handle === undefined) {
      throw new Error(
        'Required parameter handle was null or undefined when calling addProject.'
      );
    }

    let headers = new HttpHeaders();
    if (handle !== undefined && handle !== null) {
      headers = headers.set('AccountId', String(handle.accountId));
      headers = headers.set('Authorization', 'Bearer ' + btoa(handle.token));
    }

    // verify required parameter 'lCustomization' is not null or undefined
    if (lProject === null || lProject === undefined) {
      throw new Error(
        'Required parameter lCustomization was null or undefined when calling deletelProject.'
      );
    }

    headers = headers.set('Content-Type', 'application/json');

    return this.http.delete<Result<void>>(path, {
      body: lProject,
      headers: headers,
    });
  }

  public saveProject(
    authorization: string,
    project: Project
  ): Observable<Result<Project>> {
    const path = this.basePath + '/projects/update';

    let headers = new HttpHeaders();

    if (project === null || project === undefined) {
      throw new Error(
        'Required parameter accounts was null or undefined when calling saveProject.'
      );
    }

    // verify required parameter 'authorization' is not null or undefined
    if (authorization === null || authorization === undefined) {
      throw new Error(
        'Required parameter authorization was null or undefined when calling saveProject.'
      );
    }
    if (authorization !== undefined && authorization !== null) {
      headers = headers.set('Authorization', 'Bearer ' + btoa(authorization));
    }

    headers = headers.set('Content-Type', 'application/json');

    return this.http.put<Result<Project>>(path, project, { headers: headers });
  }

  public addProject(
    handle: Handle,
    project: Project
  ): Observable<Result<Project>> {

    if (handle === null || handle === undefined) {
      throw new Error(
        'Required parameter handle was null or undefined when calling addProject.'
      );
    }

    if (project === null || project === undefined) {
      throw new Error(
        'Required parameter customization was null or undefined when calling addProject.'
      );
    }

    let headers = new HttpHeaders();
    if (handle !== undefined && handle !== null) {
      headers = headers.set('AccountId', String(handle.accountId));
      headers = headers.set('Authorization', 'Bearer ' + btoa(handle.token));
    }

    return this.http.post<Result<Project>>(
      `${this.basePath}/projects/add`,
      project,
      {
        headers: headers,
      });
  }
}

