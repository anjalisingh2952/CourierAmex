import { Injectable } from "@angular/core";

import { TranslateService } from "@ngx-translate/core";
import { Subject, takeUntil } from "rxjs";

const translateValues = [
  'Labels.Error',
  'Labels.InvalidLogin',
  'Labels.InternalError',
  'Labels.DeleteTitle',
  'Labels.DeleteMessage',
  'Labels.Confirm',
  'Labels.Cancel',
  'Labels.DeleteEntry',
  'Labels.DeleteSuccessfully',
  'Labels.SaveChanges',
  'Labels.SaveSuccessfully',
  'Labels.Information',
  'Labels.ForgotEmailSent',
  'Labels.InvalidEmail',
  'Labels.InvalidLogin',
  'Labels.PasswordChangeTitle',
  'Labels.PasswordChangeSuccessfully',
  'UserDetails.ResetPasswordSuccess',
  'UserDetails.UserWithNoEmail',
  'UserDetails.CreatePasswordSuccess',
  'ControlCodes.SaveChanges',
  'ClientCategoryDetails.WarningSelectProducts',
  'CustomerDetails.SelectShipType',
  'Labels.CountryErrorTitle',
  'Labels.CountryErrorText',
  'UserProfile.PasswordChangedTitle',
  'UserProfile.PasswordChanged',
  'UserProfile.InvalidInformation',
  'Manifests.OpenTitle',
  'Manifests.OpenMessage',
  'Manifests.OpenTitle',
  'Manifests.OpenSuccessfully',
  'Manifests.InvalidDelete',
  'Labels.TemporaryPasswordTitle',
  'Labels.TemporaryPassword',
  "Labels.CompanyNotSelectedError",
  "CreditPending.Zonevalidation",
  "ManifestDetails.isManiFestOpen",
  "ManifestDetails.AddressEmpty",
  "ManifestDetails.TrackingNumberEmpty",
  "ManifestDetails.DeleteAllPackages",
  "ManifestDetails.DeletePackage",
  "RouteSheet.ConfirmReopen",
  "RouteSheet.ConfirmReopenMessage",
  "RouteSheet.ReopenRoadmapSuccess",
  "RouteSheet.ReopenRoadmapError",
  "Labels.PaymentSelect",
  "Labels.SelectDoc",
  "Labels.FailedToConnect",
  "Labels.PrintedSuccessfully",
  "Labels.FailedToConnect",
  "Labels.SelectPrinter",
  "Labels.Warning",
  "Labels.NoExchangeRate",
  "Labels.AddExchangeRate",
  "Labels.CancelPaymentSuccess",
  "Labels.CancelPaymentError",
  "InvoiceHistory.ConfermationCancelPayment",
  "Labels.PaymentAlreadyCancelled",
  "InvoiceHistory.ConfermationCancelInvoice",
  "InvoiceHistory.SelectInvoice",
  "InvoiceHistory.CancelInvoiceSuccess",
  "InvoiceHistory.IsElectronicInvoiceProcessed",
  "InvoiceHistory.InvoiceAlreadyCancelled",
  "InvoiceHistory.InvoicePartiallyPaid",
  "InvoiceHistory.InvoiceAlreadyPaid"
];

@Injectable()
export class MessageService {
  messages: any = {};
  destroy$ = new Subject<void>();

  constructor(
    private translate: TranslateService
  ) {
    this.translate.get(translateValues)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        translations => {
          translateValues.forEach(t => {
            this.messages[t] = translations[t];
          });
        });
  }

  public getTranslate(value: string): string {
    //debugger
    return this.messages[value] ?? '';
  }
}
