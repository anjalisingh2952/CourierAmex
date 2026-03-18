"use strict";
exports.__esModule = true;
var appMenus = [
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
                'title': 'Sidebar.Manifests'
            },
            {
                'url': '/manifest/air-classify',
                'title': 'Sidebar.AirClassify'
            },
            {
                'url': '/manifest/package-scanning',
                'title': 'Sidebar.PackageScanning'
            },
        ]
    },
    {
        'icon': 'fa-solid fa-file-invoice-dollar',
        'title': 'Sidebar.Invoice',
        'url': '/manifest',
        'caret': 'true',
        'submenu': [
            {
                'url': '/invoice/invoice-histroy',
                'title': 'Sidebar.InvoiceHistory'
            },
            {
                'url': '/invoice/invoice-report',
                'title': 'Sidebar.GenerateReport'
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
                'title': 'Sidebar.PointOfSale'
            },
            {
                'url': '/payment/generate-delivery-proof',
                'title': 'Sidebar.PaymentsProof'
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
                'title': 'Sidebar.CreatePackage'
            },
            {
                'url': '/package/list',
                'title': 'Sidebar.ListPackages'
            },
            {
                'url': '/package/event-list',
                'title': 'Sidebar.ListPackageEvents'
            },
            {
                'url': '/package/package-category',
                'title': 'Sidebar.PackageCategory'
            },
            {
                'url': '/package/package-classify',
                'title': 'Sidebar.PackageClassify'
            },
            {
                'url': '/package/packing-packages-consolidated',
                'title': 'Sidebar.PackingPackagesConsolidated'
            },
            {
                'url': '/package/packing-packages-courier',
                'title': 'Sidebar.PackingPackagesCourier'
            },
            {
                'url': '/package/packing-packages-aeropost',
                'title': 'Sidebar.PackingPackagesAeropost'
            },
            {
                'url': '/package/package-assign-prices',
                'title': 'Sidebar.PackageAssignPrices'
            },
            {
                'url': '/package/pre-study',
                'title': 'Sidebar.PackagePreStudy'
            },
            {
                'url': '/package/package-lognotes',
                'title': 'Sidebar.PackageLogNotes'
            },
            {
                'url': '/package/package-notes',
                'title': 'Sidebar.PackageNotes'
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
                    }
                ]
            },
            {
                'url': '/customer',
                'title': 'Sidebar.Customer',
                'caret': 'true',
                'submenu': [
                    {
                        'url': '/customer/list',
                        'title': 'Sidebar.Customers'
                    },
                ]
            },
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
exports["default"] = appMenus;
