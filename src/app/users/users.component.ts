import { Component, OnInit, OnDestroy } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Subject } from "rxjs";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { RoleService } from "../services/role.service";
import * as CONST from "../app-const";
import { Role } from "../models/role.model";
import { UserService } from "../services/user.service";
import { User } from "../models/user.model";
import { AlertService } from "../services/alert.service";
import { AuthenticationService } from "../services/authentication.service";
import * as XLSX from "xlsx";
import { GroupService } from "../services/group.service";
import { Group } from "../models/group.model";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
  allUsers: User[] = [];
  data: User[] = [];
  roles: Role[] = [];
  user: User = new User;
  idToDelete: number;
  returnUrl: string;
  showDeleteUserModal = false;
  loading = false;
  userListCreateLoading = false;
  mainLoading = true;
  showUserModal = false;
  canEdit = false;
  canBlock = false;
  blockLoading = false;
  private alert: AlertService;
  groups: Group[] = [];
  pages: any = [5, 10, 25];

  convertedJson: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private userService: UserService,
    private alertService: AlertService,
    private authService: AuthenticationService,
    private groupService: GroupService
  ) {
    this.alert = alertService;


  }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl =
      this.route.snapshot.queryParams["returnUrl"] || "/admin/role";
    this.getRoles();
    this.getUsers();
    // this.canEdit = await this.authService.hasPrivilege(22);
    // this.canBlock = await this.authService.hasPrivilege(24);
    this.getGroups();
  }

  //This function is used to get roles
  async getRoles() {
    await this.roleService.getRoles().subscribe((data: Role[]) => {
      this.roles = data;
    });
  }

  getGroups(): void {
    this.groupService.getGroups().subscribe((data: Group[]) => {
      this.groups = data;
    });
  }

  //This function is used to get users
  getUsers() {
    console.log("sndmssssssssssssssssssssssssssss")
    this.userService.getUsers().toPromise().then((data: User[] | undefined) => {
      console.log(data, "   sdd             ")
      this.data = (data !== undefined) ? data : [];
      this.allUsers = data!;
      this.mainLoading = false;
    }).catch((err) => {
      console.log(err)
      this.alert.error("" + err);
      this.mainLoading = false;
    })

    // next: (data: User[]) => {
    //   console.log("bsdbsnbnbsnbd");
    //   this.data = data!;
    //   this.allUsers = data!;
    //   this.mainLoading = false;
    // },
    // error: (err: HttpErrorResponse) => {
    //   this.alert.error("" + err);
    //   this.mainLoading = false;
    // }

  }

  //this function is used to block/deblock user
  async block(id: number, status: boolean) {
    this.blockLoading = true;
    await this.userService
      .blockUser(id, status)
      .then((data) => {
        if (status) {
          this.alertService.success("Utilisateur bloqué avec succès !");
          this.data.filter((x) => x.id === id)[0].isBlocked = true;
        } else {
          this.alertService.success("Utilisateur debloqué avec succès !");
          this.data.filter((x) => x.id === id)[0].isBlocked = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.alertService.error("" + err);
        this.blockLoading = false;
      });
  }

  //This function is used by dataTable to filter elements
  search(term: string) {
    if (!term) {
      this.data = this.allUsers;
    } else {
      this.data = this.allUsers.filter(
        (x) =>
          x.firstName
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.lastName.trim().toLowerCase().includes(term.trim().toLowerCase())
      );
    }
  }

  editUser(userId: number) {
    this.router.navigate(["/admin/users", userId]);
  }

  //This function is used to set user id before deleting
  setIdToDetele(userId: number) {
    this.showDeleteUserModal = true;
    this.idToDelete = userId;
  }

  //This function is use to delete a role
  async deleteUser() {
    if (this.idToDelete != null) {
      await this.userService
        .deleteUser(this.idToDelete)
        .then((data) => {
          this.showDeleteUserModal = false;
          this.alertService.success("Utilisateur supprimé avec succès !");
          this.getUsers();
        })
        .catch((err: HttpErrorResponse) => {
          this.showDeleteUserModal = false;
          this.alertService.error("" + err);
          this.loading = false;
        });
    } else {
      this.showDeleteUserModal = false;
      this.alertService.error("Identifiant de l'élément introuvable !");
      this.loading = false;
    }
  }

  //This function return all details about the selected log
  details(id: number) {
    this.user = this.data.filter((x) => x.id === id)[0];
    this.showUserModal = true;
  }

  fileUpload(event: any) {
    this.userListCreateLoading = true;
    const selectedFiles = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFiles);

    fileReader.onload = (event: any) => {
      let binaryData = event.target.result;
      let workbook = XLSX.read(binaryData, { type: "binary" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet);
      this.convertedJson = JSON.stringify(data, undefined, 4);
      this.enrolGroupOfUser(this.convertedJson);
    };
  }

  async enrolGroupOfUser(jsonData: any) {
    let data = JSON.parse(jsonData);
    const userList: { firstName: any; lastName: any; email: any; login: any; password: any; telephone: any; grade: any; isBlocked: boolean; groups: Group[]; roles: Role[]; }[] = [];

    data.forEach((data1: any) => {
      // USER ROLE
      let userRoles: Role[] = [];
      data1.roles.split(",").forEach((role: any) => {
        userRoles.push(this.roles.filter((r) => r.name == role)[0]);
      });

      // USER GROUPS
      let userGroups: Group[] = [];
      data1.groups.split(",").forEach((group: any) => {
        userGroups.push(this.groups.filter((r) => r.name == group)[0]);
      });

      const user = {
        firstName: data1.firstname,
        lastName: data1.lastname,
        email: data1.email,
        login: data1.login,
        password: data1.login,
        telephone: data1.phone,
        grade: data1.grade,
        isBlocked: false,
        groups: userGroups,
        roles: userRoles,
      };

      userList.push(user);
    });
    this.userListCreateLoading = false;

    await this.userService
      .addUserFromGroup(userList)
      .then((data) => {
        this.alertService.success("Nouvel utilisateur ajouté avec succès !");
        // this.loading = false;
        // this.router.navigate(["/admin/users"]);
      })
      .catch((err: HttpErrorResponse) => {
        this.alertService.error("" + err);
        // this.loading = false;
      });
  }
}
