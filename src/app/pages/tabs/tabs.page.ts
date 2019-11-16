import { Component } from '@angular/core';
import { UserData } from '../../providers/user-data';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  constructor(
    private userData: UserData,
    private alertController: AlertController,
    private router: Router,
  ) {}
}
