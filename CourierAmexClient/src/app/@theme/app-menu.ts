import { AppMenu } from "@app/models";

const appMenus: AppMenu[] = [
  {
    'icon': 'fa fa-sitemap',
    'title': 'Sidebar.Dashboard',
    'url': '/home/dashboard'
  },
  {
    'icon': 'fa fa-clipboard-list',
    'title': 'Sidebar.Manifest',
    'url': '/manifest',
    'caret': 'true',
    'submenu': [
      {
        'url': '/manifest/list',
        'title': 'Sidebar.Manifests',
      },
      {
        'url': '/manifest/air-classify',
        'title': 'Sidebar.AirClassify',
      },
      {
        'url': '/manifest/package-scanning',
        'title': 'Sidebar.PackageScanning',
      },
      {
        'url': '/manifest/manage-route-sheet',
        'title': 'Sidebar.ManagePackagesRoute',
      },
      {
        'url': '/manifest/re-open-roadmap',
        'title': 'Sidebar.ReOpenRoadMap',
      }
    ]
  },
  {
    'icon': 'fa-solid fa-file-invoice-dollar',
    'title': 'Sidebar.Invoice',
    'url': '/invoice',
    'caret': 'true',
    'submenu': [
      {
        'url': '/invoice/invoice-history',
        'title': 'Sidebar.InvoiceHistory',
      },
      {
        'url': '/invoice/invoice-report',
        'title': 'Sidebar.GenerateReport',
      },
      {
        'url': '/invoice/generate-invoice',
        'title': 'Sidebar.GenerateInvoice',
      }, {
        'url': '/invoice/load-customs-taxex',
        'title': 'Sidebar.LoadCustomsTaxex',
      }, {
        'url': '/invoice/aeropost-mass-upload',
        'title': 'Sidebar.AeropostMassUpload',
      }
    ]
  },
  {
    'icon': 'fas fa-money-check-alt',
    'title': 'Sidebar.Payment',
    'url': '/payment',
    'caret': 'true',
    'submenu': [
      {
        'url': '/payment/open-close-point-of-sale',
        'title': 'Sidebar.PointOfSale',
      },
      {
        'url': '/payment/generate-delivery-proof',
        'title': 'Sidebar.PaymentsProof',
      }
    ]
  },
  {
    'icon': 'fa fa-boxes',
    'title': 'Sidebar.Packages',
    'url': '/package',
    'caret': 'true',
    'submenu': [
      {
        'url': '/package/details',
        'title': 'Sidebar.CreatePackage',
      },
      {
        'url': '/package/list',
        'title': 'Sidebar.ListPackages',
      },
      {
        'url': '/package/event-list',
        'title': 'Sidebar.ListPackageEvents',
      },
      {
        'url': '/package/package-category',
        'title': 'Sidebar.PackageCategory',
      },
      {
        'url': '/package/package-classify',
        'title': 'Sidebar.PackageClassify',
      },
      {
        'url': '/package/packing-packages-consolidated',
        'title': 'Sidebar.PackingPackagesConsolidated',
      },
      {
        'url': '/package/packing-packages-courier',
        'title': 'Sidebar.PackingPackagesCourier',
      },
      {
        'url': '/package/packing-packages-aeropost',
        'title': 'Sidebar.PackingPackagesAeropost',
      },
      {
        'url': '/package/package-assign-prices',
        'title': 'Sidebar.PackageAssignPrices',
      },
      {
        'url': '/package/pre-study',
        'title': 'Sidebar.PackagePreStudy',
      },
      {
        'url': '/package/package-lognotes',
        'title': 'Sidebar.PackageLogNotes',
      },
      {
        'url': '/package/package-notes',
        'title': 'Sidebar.PackageNotes',
      },
      {
        'url': '/package/package-inventory',
        'title': 'Sidebar.PackageInventory'
      },
      {
        'url': '/package/has-invoice-maintenance',
        'title': 'Sidebar.HasInvoiceMaintenance'
      },
      {
        'url': '/package/price-image-maintenance',
        'title': 'Sidebar.PriceImageMaintenance'
      }
    ]
  }
  , {
    'icon': 'fa fa-users',
    'title': 'Sidebar.Customers',
    'url': '/customer/list',
    'caret': 'true',
    'submenu': [
      {
        'url': '/customer/list',
        'title': 'Sidebar.Customers'
      }, {
        'url': '/customer/customer-service',
        'title': 'Sidebar.CustomerService'
      }, {
        'url': '/customer/enabled-credit',
        'title': 'Sidebar.EnabledCredit'
      }
    ]
  }
  , {
    'icon': 'fas fa-file',
    'title': 'Sidebar.Reports',
    'url': '/reports',
    'caret': 'true',
    'submenu': [

      {
        'url': '/manifest',
        'title': 'Sidebar.Manifest',
        'caret': 'true',
        'submenu': [
          {
            'url': '/reports/manifest-reports',
            'title': 'Sidebar.ManifestReports',
          },
          {
            'url': '/reports/manifest-report-observations',
            'title': 'Sidebar.ManifestReportObservations',
          },
          {
            'url': '/reports/courier-consolidated',
            'title': 'Sidebar.CourierConsolidated',
          },
          {
            'url': '/reports/courier-deconsolidation',
            'title': 'Sidebar.CourierDeconsolidation',
          },
          {
            'url': '/reports/detailed-billing',
            'title': 'Sidebar.DetailedBilling',
          }, {
            'url': '/reports/manifest-report-by-bag',
            'title': 'Sidebar.ManifestReportByBag',
          },


        ]
      }, {
        'url': '/invoice',
        'title': 'Sidebar.Invoice',
        'caret': 'true',
        'submenu': [
          {
            'url': '/reports/credit-pending',
            'title': 'Sidebar.CreditPending',
          },
          {
            'url': '/reports/pending-invoices',
            'title': 'Sidebar.PendingInvoices',
          },
          {
            'url': '/reports/summary',
            'title': 'Sidebar.Summary',
          },
          {
            'url': '/reports/sales-detail',
            'title': 'Sidebar.SalesDetail',
          },
          {
            'url': '/reports/customs-taxes',
            'title': 'Sidebar.CustomsTaxes',
          }
        ]
      }, {
        'url': '/packages',
        'title': 'Sidebar.Packages',
        'caret': 'true',
        'submenu': [
          {
            'url': '/reports/pending-manifest-or-pre-study',
            'title': 'Sidebar.PendingManifestPreStudy',
          },
        ]
      }, {
        'url': '/suppliers',
        'title': 'Sidebar.Suppliers',
        'caret': 'true',
        'submenu': [
          {
            'url': '/reports/purchases',
            'title': 'Sidebar.Purchases',
          },
        ]
      }
    ]
  },
  {
    'icon': 'fa fa-gears',
    'title': 'Sidebar.Settings',
    'url': '/settings',
    'caret': 'true',
    'submenu': [
      {
        'url': '/company',
        'title': 'Sidebar.Company',
        'caret': 'true',
        'submenu': [
          {
            'url': '/company/list',
            'title': 'Sidebar.Companies'
          },
          {
            'url': '/company/cashiers',
            'title': 'Sidebar.Cashiers'
          },
          {
            'url': '/company/categories',
            'title': 'Sidebar.ClientCategories'
          },
          {
            'url': '/company/commodities',
            'title': 'Sidebar.Commodities'
          },
          {
            'url': '/company/document-types',
            'title': 'Sidebar.DocumentTypes'
          },
          {
            'url': '/company/supplier-list',
            'title': 'Sidebar.Suppliers'
          },
          {
            'url': '/company/location-list',
            'title': 'Sidebar.Locations'
          },
          {
            'url': '/company/pay-types',
            'title': 'Sidebar.CustomerPayTypes'
          },
          {
            'url': '/company/document-pay-types',
            'title': 'Sidebar.DocumentPayTypes'
          },
          {
            'url': '/company/payment-types',
            'title': 'Sidebar.PaymentTypes'
          },
          {
            'url': '/company/exchange-rate',
            'title': 'Sidebar.ExchangeRateList'
          }


        ]
      },
      /* {
         'url': '/customer',
         'title': 'Sidebar.Customer',
         'caret': 'true',
         'submenu': [
           {
             'url': '/customer/list',
             'title': 'Sidebar.Customers'
           },
         ]
       },*/
      {
        'url': '/settings/general',
        'title': 'Sidebar.General',
        'caret': 'true',
        'submenu': [
          {
            'url': '/general/control-codes',
            'title': 'Sidebar.ControlCodes'
          },
          {
            'url': '/general/countries',
            'title': 'Sidebar.Countries'
          },
          {
            'url': '/general/states',
            'title': 'Sidebar.States'
          },
          {
            'url': '/general/zones',
            'title': 'Sidebar.Zones'
          },
          {
            'url': '/general/areas',
            'title': 'Sidebar.Areas'
          },
          {
            'url': '/general/package-status',
            'title': 'Sidebar.PackageStatus'
          },
          {
            'url': '/general/shipping-way-types',
            'title': 'Sidebar.ShippingWayTypes'
          },
        ]
      },
      {
        'url': '/user',
        'title': 'Sidebar.User',
        'caret': 'true',
        'submenu': [
          {
            'url': '/user/roles',
            'title': 'Sidebar.Roles'
          },
          {
            'url': '/user/list',
            'title': 'Sidebar.Users'
          }
        ]
      },
    ]
  }
];

export default appMenus;