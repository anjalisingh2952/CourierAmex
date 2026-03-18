/// <reference types="w3c-web-hid" />
import { Injectable, NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { ConfigLoaderService } from './config-loader.service';
import { HttpClient } from '@angular/common/http';
import { ConfigModel } from '@app/models';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class WeightReaderService {
  config?: ConfigModel;
  destroy$ = new Subject<void>();
  public weight$ = new BehaviorSubject<{ lbs: number; kg: number } | null>(null);
  private device: HIDDevice | null = null;
  private lastWeightLbs: number | null = null;
  private eventSource: EventSource | null = null;

  constructor(
    public configService: ConfigLoaderService,
    public http: HttpClient,
    private zone: NgZone,
    private toastr: ToastrService
  ) {
    this.configService.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => this.config = config);
  }

  getWeightStream(): Observable<{ lbs: number, kg: number }> {
    return new Observable(observer => {
      const eventSource = new EventSource('https://localhost:5005/api/v1/Scale/stream');
      eventSource.onmessage = (event) => {
        this.zone.run(() => {
          try {
            const [lbsStr, kgStr] = event.data.split(',');
            const parsedData = {
              lbs: parseFloat(lbsStr),
              kg: parseFloat(kgStr)
            };
            observer.next(parsedData);
          } catch (error) {
            observer.error('Failed to parse weight data');
          }
        });
      };

      eventSource.onerror = (error) => {
        this.zone.run(() => {
          observer.error(error);
          eventSource.close();
        });
      };

      return () => {
        eventSource.close();
      };
    });
  }

  stopScale(): Observable<string> {
    return this.http.post<string>(`https://localhost:5005/api/v1/Scale/stop`, null).pipe();
  }

  stopWeightStream(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }
  // Connect to the HID device
  // This method uses the WebHID API to request a device from the user. It filters for devices with a specific vendorId and productId.
  async connect(): Promise<boolean> {
    try {
      if (!navigator.hid) throw new Error('WebHID API not supported');

      const [device] = await navigator.hid.requestDevice({
        filters: [{ vendorId: 0x0eb8, productId: 0xf000 }]
      });

      if (!device) throw new Error('No device selected');

      await device.open();
      this.device = device;

      // Get input report from the device
      // The device is expected to send data in a specific format, so we set up an event listener to handle incoming reports.
      device.oninputreport = (event) => {
        const data = new Uint8Array(event.data.buffer);
        const weight = this.parseWeight(data);
        if (weight.lbs !== this.lastWeightLbs) {
          this.weight$.next(weight);
          this.lastWeightLbs = weight.lbs;
          console.log(`Weight: ${weight.lbs} lbs, ${weight.kg} kg`);
        }
      };

      Swal.fire("Success", 'Connected to scale', "success")
      return true;
    } catch (error) {
      Swal.fire("Erorr", (error as Error).message || 'Connection failed', "error");
      return false;
    }
  }

  // Parse the weight data from the device
  // This method takes a Uint8Array as input, which represents the data received from the HID device.
  private parseWeight(data: Uint8Array): { lbs: number; kg: number } {
    const rawWeight = (data[4] << 8) | data[3];
    const lbs = +(rawWeight / 100).toFixed(2);
    const kg = +(lbs * 0.453592).toFixed(2);
    return { lbs, kg };
  }

  // Disconnect from the device
  // This method closes the connection to the HID device and resets the device variable to null.
  async disconnect(): Promise<void> {
    if (this.device && this.device.opened) {
      await this.device.close();
      Swal.fire("Info", "Disconnected from scale", "info")
      this.device = null;
    }
  }

  async getDeviceInfo(): Promise<{ productName: string }> {
    if (!this.device) return { productName: 'Unknown' };
    return { productName: this.device.productName || 'Unknown' };
  }
}
