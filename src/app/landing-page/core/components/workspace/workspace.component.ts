import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/models/project';
import { ProjectsService } from 'src/app/services/projects.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { WorkspaceService } from 'src/app/workspace/workspace.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit {
  navClass = 'nav-light';

  Menuoption = 'hosting';
  Settingicon = true
  footerVariant = 'footer-ten';

  lProject: Project[] = [];

  sidebarCollapse = true;

  filterredImages;
  galleryFilter = 'all';
  list = [{
    image: 'assets/bootstrap/images/work/1.jpg',
    title: 'Shifting',
    type: 'Studio',
    category: 'branding'
  },
  {
    image: 'assets/bootstrap/images/work/2.jpg',
    title: 'Colors Magazine',
    type: 'Web Design',
    category: 'designing'
  },
  {
    image: 'assets/bootstrap/images/work/3.jpg',
    title: 'Spa Cosmetics',
    type: 'Developing',
    category: 'photography',
  },
  {
    image: 'assets/bootstrap/images/work/4.jpg',
    title: 'Riser Coffee',
    type: 'Branding',
    category: 'development',
  },
  ];

  constructor(
    private workspaceService: WorkspaceService,
    private projectService: ProjectsService,
    private tokenStorage: TokenStorageService
  ) {

  }

  ngOnInit(): void {
    this.filterredImages = this.list;
    /*this.projectService.getlProject(this.tokenStorage.getToken()).subscribe((ret) =>
      {
        if (ret.successful){
          this.lProject = ret.content;
        }
      }
    );*/
    let project0 = new Project();
    project0.id = 1;

    this.lProject.push(project0);

    let project1 = new Project();
    project1.id = 1;
    this.lProject.push(project1);

    let project2 = new Project();
    project2.id = 2;
    this.lProject.push(project2);

    this.workspaceService.setlProject(this.lProject);
  }

  hideOffcanvas() {
    var sidebarCollapse = document.getElementById("sidebar");
    if (this.sidebarCollapse) {
      sidebarCollapse.classList.add('active');
      this.sidebarCollapse = false;
    } else {
      sidebarCollapse.classList.remove('active');
      this.sidebarCollapse = true;
    }
  }

  activeCategory(templateToFind) {
    this.galleryFilter = templateToFind;
    if (this.galleryFilter === null || this.galleryFilter === undefined) {
      this.filterredImages = this.list;
    } else {
      this.filterredImages = this.list.filter(x => x.category.includes(this.galleryFilter));
    }
  }

  openTemplate(){

  }

  openProject(){

  }
}
