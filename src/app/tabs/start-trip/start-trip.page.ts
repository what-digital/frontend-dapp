import {Component, OnInit} from '@angular/core';
import {ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {TabsControllerService} from '../../services/tabs-controller/tabs-controller.service';
import {Web3Service} from '../../services/web3/web3.service';
import {TripService} from '../../services/trip-verification/trip-verification.service';

@Component({
    selector: 'app-start-trip',
    templateUrl: './start-trip.page.html',
    styleUrls: ['./start-trip.page.scss'],
})
export class StartTripPage implements OnInit {
    public isScannerEnabled = true;

    public transporterPubKey = '';
    public onScan = new Subject();

    constructor(
        private tabsController: TabsControllerService,
        private web3Service: Web3Service,
        private router: Router,
        private tripService: TripService,
        private toastController: ToastController,
    ) {
    }

    ionViewWillEnter() {
        this.isScannerEnabled = true;
    }

    ionViewWillLeave() {
        console.log('will leave');
        this.isScannerEnabled = false;
    }


    ngOnInit() {
        this.tabsController.tabSubject.subscribe(async name => {
            console.log(name);
            this.isScannerEnabled = (name === 'start-trip');
        });
        this.onScan.subscribe(() => {
            this.isScannerEnabled = false;
            this.router.navigate(['/tabs/trips']);
        });
    }

    updateKey(ev: any) {
        console.log(ev.detail, ev.detail.value.length);
        this.transporterPubKey = ev.detail.value;
    }

    onErrorInScanning($event: Error) {

    }

    async checkIn(address?: string) {
        this.transporterPubKey = address || this.transporterPubKey;
        this.web3Service.contract.methods.checkIn(this.transporterPubKey)
            .send(
                {
                    from: this.web3Service.accountAddress,
                    gas: 3000000,
                },
            )
            .on('receipt', (receipt) => {
                this.onScan.next();
            })
            .on('error', async (error) => {
                const toast = await this.toastController.create({
                    message: 'Check in attempt failed',
                    position: 'bottom',
                });
                toast.present();
                console.log(error);
            });
    }

    onFailedScan($event: Error) {
    }
}
