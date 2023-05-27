import { Component } from '@angular/core';
import { OfflineStorageService } from '../offline-storage.service';


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})




export class TestComponent {
  constructor(private offlineStorageService: OfflineStorageService) {

  }

  addAction(): void {
    const action = { /* Define your action data here */ };
    this.offlineStorageService.addAction(action)
      .then(() => {
        console.log('Action stored offline');
      })
      .catch((error) => {
        console.error('Failed to store action offline', error);
      });
  }

  flushActions(): void {
    this.offlineStorageService.getActions()
      .then((actions) => {
        // Send actions to the server
        console.log('Sending actions to the server:', actions);

        // Once the actions are successfully sent, clear them from the offline storage
        this.offlineStorageService.flushActions()
          .then(() => {
            console.log('Actions flushed from offline storage');
          })
          .catch((error) => {
            console.error('Failed to flush actions from offline storage', error);
          });
      })
      .catch((error) => {
        console.error('Failed to retrieve actions from offline storage', error);
      });
  }
}
