using System.Text;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;

using CourierAmex.Storage.Repositories;
using CourierAmex.Infrastructure;
using CourierAmex.Services;
using CourierAmex.Storage;
using CourierAmex.HostedServices;
using CourierAmex.Services.Interfaces;
using Microsoft.OpenApi.Models;
using CourierAmex.Storage.Repositories.Interfaces;

namespace CourierAmex
{
    public static class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var bindUrlSettings = new UrlSettings();
            builder.Configuration.Bind("UrlSettings", bindUrlSettings);
            builder.WebHost.UseUrls(bindUrlSettings.HttpUrl ?? "5000", bindUrlSettings.HttpsUrl ?? "5005");

            var readConnection = builder.Configuration.GetConnectionString("ReadConnection");
            var writeConnection = builder.Configuration.GetConnectionString("WriteConnection");

            var bindJwtSettings = new JwtSettings();
            builder.Configuration.Bind("JsonWebTokenKeys", bindJwtSettings);
            builder.Services.AddSingleton(bindJwtSettings);

            if (readConnection != null && writeConnection != null)
            {
                builder.Services.AddScoped<IDalSession>(_ => new DalSession(readConnection, writeConnection));
            }

            builder.Services.AddScoped<IExchangeRateFetcher, ExchangeRateFetcher>();

            //Add Repositories
            builder.Services.AddScoped<ISystemSettingRepository, SystemSettingRepository>();
            builder.Services.AddScoped<IEmailQueueRepository, EmailQueueRepository>();
            builder.Services.AddScoped<ICountryRepository, CountryRepository>();
            builder.Services.AddScoped<IDocumentTypeRepository, DocumentTypeRepository>();
            builder.Services.AddScoped<IPermissionRepository, PermissionRepository>();
            builder.Services.AddScoped<IRoleRepository, RoleRepository>();
            builder.Services.AddScoped<IStateRepository, StateRepository>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
            builder.Services.AddScoped<IClientCategoryRepository, ClientCategoryRepository>();
            builder.Services.AddScoped<ISupplierRepository, SupplierRepository>();
            builder.Services.AddScoped<ILocationRepository, LocationRepository>();
            builder.Services.AddScoped<IProductRepository, ProductRepository>();
            builder.Services.AddScoped<ICustomerPayTypeRepository, CustomerPayTypeRepository>();
            builder.Services.AddScoped<IZoneRepository, ZoneRepository>();
            builder.Services.AddScoped<IAreaRepository, AreaRepository>();
            builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
            builder.Services.AddScoped<ICashierRepository, CashierRepository>();
            builder.Services.AddScoped<IPackageStatusRepository, PackageStatusRepository>();
            builder.Services.AddScoped<IShippingWayTypeRepository, ShippingWayTypeRepository>();
            builder.Services.AddScoped<ICommodityRepository, CommodityRepository>();
            builder.Services.AddScoped<IManifestRepository, ManifestRepository>();
            builder.Services.AddScoped<IPackageRepository, PackageRepository>();
            builder.Services.AddScoped<IPackageItemRepository, PackageItemRepository>();
            builder.Services.AddScoped<IPaymentTypeRepository, PaymentTypeRepository>();
            builder.Services.AddScoped<IDocumentPayTypeRepository, DocumentPayTypeRepository>();
            builder.Services.AddScoped<ICurrencyRepository, CurrencyRepository>();
            builder.Services.AddScoped<IBankRepository, BankRepository>();
            builder.Services.AddScoped<IModuleRepository, ModuleRepository>();
            builder.Services.AddScoped<ITemplateRepository, TemplateRepository>();
            builder.Services.AddScoped<IAirGuideRepository, AirGuideRepository>();
            builder.Services.AddScoped<IPackageLogNotesRepository, PackageLogNotesRepository>();
            builder.Services.AddScoped<IPackageNotesRepository, PackageNotesRepository>();
            builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();
            builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
            builder.Services.AddScoped<ICompanyInvoiceRepository, CompanyInvoiceRepository>();
            builder.Services.AddScoped<IPendingManifestOrPreStudyRepository, PendingManifestOrPreStudyRepository>();
            builder.Services.AddScoped<IManifestDetailedBillingRepository, ManifestDetailedBillingRepository>();
            builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();
            builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();



            //builder.Services.AddScoped<IPaymentTypeRepository, PaymentTypeRepository>();

            // Add services to the container.
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Your API", Version = "v1" });

                // Add JWT Authentication
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter 'Bearer' [space] and then your valid token."
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
            });
            builder.Services.AddScoped<JwtAuthService>();

            builder.Services.AddScoped<ISystemSettingService, SystemSettingService>();
            builder.Services.AddScoped<IEmailQueueService, EmailQueueService>();
            builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();

            builder.Services.AddScoped<ICommonService, CommonService>();
            builder.Services.AddScoped<ICountryService, CountryService>();
            builder.Services.AddScoped<IStateService, StateService>();
            builder.Services.AddScoped<IDocumentTypeService, DocumentTypeService>();
            builder.Services.AddScoped<IRoleService, RoleService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<ICompanyService, CompanyService>();
            builder.Services.AddScoped<IClientCategoryService, ClientCategoryService>();
            builder.Services.AddScoped<ISupplierService, SupplierService>();
            builder.Services.AddScoped<ILocationService, LocationService>();
            builder.Services.AddScoped<IProductService, ProductService>();
            builder.Services.AddScoped<ICustomerPayTypeService, CustomerPayTypeService>();
            builder.Services.AddScoped<IZoneService, ZoneService>();
            builder.Services.AddScoped<IAreaService, AreaService>();
            builder.Services.AddScoped<ICustomerService, CustomerService>();
            builder.Services.AddScoped<ICashierService, CashierService>();
            builder.Services.AddScoped<IPackageStatusService, PackageStatusService>();
            builder.Services.AddScoped<IShippingWayTypeService, ShippingWayTypeService>();
            builder.Services.AddScoped<ICommodityService, CommodityService>();
            builder.Services.AddScoped<IManifestService, ManifestService>();
            builder.Services.AddScoped<IPackageService, PackageService>();
            builder.Services.AddScoped<IPackageItemService, PackageItemService>();
            builder.Services.AddScoped<IPaymentTypeService, PaymentTypeService>();
            builder.Services.AddScoped<IDocumentPayTypeService, DocumentPayTypeService>();
            builder.Services.AddScoped<ICurrencyService, CurrencyService>();
            builder.Services.AddScoped<IBankService, BankService>();
            builder.Services.AddScoped<IModuleService, ModuleService>();
            builder.Services.AddScoped<ITemplateService, TemplateService>();
            builder.Services.AddScoped<IAirGuideService, AirGuideService>();
            builder.Services.AddScoped<IInvoiceService, InvoiceService>();
            builder.Services.AddScoped<IInvoiceGenerateService, InvoiceGenerateService>();

            builder.Services.AddScoped<IPackageLogNotesService, PackageLogNotesService>();
            builder.Services.AddScoped<IPackageNotesService, PackageNotesService>();
            builder.Services.AddScoped<IPaymentService, PaymentService>();
            builder.Services.AddScoped<IPrintService, PrintService>();


            builder.Services.AddScoped<ICompanyInvoiceService, CompanyInvoiceService>();
            builder.Services.AddScoped<IPendingManifestOrPreStudyService, PendingManifestOrPreStudyService>();
            builder.Services.AddScoped<IManifestDetailedBillingService, ManifestDetailedBillingService>();
            builder.Services.AddScoped<IInventoryService, InventoryService>();
            builder.Services.AddScoped<IWeightReaderService, WeightReaderService>();
            builder.Services.AddScoped<IDashboardService, DashboardService>();



            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = bindJwtSettings.ValidIssuer,
                        ValidAudience = bindJwtSettings.ValidAudience,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(bindJwtSettings.IssuerSigningKey ?? ""))
                    };
                });

            builder.Services.AddAutoMapper(typeof(Program));
            builder.Services.AddHostedService<BackgroundEmailSender>();
            builder.Services.AddAuthorization();
            builder.Services.AddControllersWithViews();
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    policy => policy.AllowAnyOrigin()
                                    .AllowAnyMethod()
                                    .AllowAnyHeader());
            });


            var app = builder.Build();
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
                    options.RoutePrefix = string.Empty;
                });

                app.UseCors("AllowAll");
                app.UseSwagger();
                app.UseSwaggerUI();
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseFileServer(new FileServerOptions
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(Environment.CurrentDirectory, "files")),
                RequestPath = "/files",
                EnableDefaultFiles = true
            });

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller}/{action=Index}/{id?}");
            app.MapFallbackToFile("index.html");
            app.Run();
        }
    }
}