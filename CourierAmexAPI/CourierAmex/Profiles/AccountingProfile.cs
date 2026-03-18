using CourierAmex.Models;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Profiles
{
    public class AccountingProfile : AutoMapper.Profile
    {
        public AccountingProfile() 
        {
            CreateMap<Module, ModuleModel>()
            .ReverseMap();

            CreateMap<Template, TemplateModel>()
            .ReverseMap();
            CreateMap<UserByPointOfSale, UserByPointOfSaleModel>();
        }
    }
}
