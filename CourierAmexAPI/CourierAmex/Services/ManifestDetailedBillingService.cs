using AutoMapper;
using CourierAmex.Models;
using CourierAmex.Services.Interfaces;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Repositories;
using CourierAmex.Storage.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CourierAmex.Services
{
    public class ManifestDetailedBillingService : IManifestDetailedBillingService
    {
        private readonly IManifestDetailedBillingRepository _repository;
        private readonly IMapper _mapper;

        public ManifestDetailedBillingService(IMapper mapper, IManifestDetailedBillingRepository repository)
        {
            _mapper = mapper;
            _repository = repository;
        }

        
        public async Task<GenericResponse<List<AverageManifest>>> GetManifestAverageByKilogramAsync(int companyId, string manifestNumber)
        {
            GenericResponse<List<AverageManifest>> result = new();

            var entities = await _repository.GetManifestAverageByKilogram(companyId, manifestNumber);
            if (entities != null)
            {
                result.Data = _mapper.Map<List<AverageManifest>>(entities);
                result.Success = true;
            }

            return result;
        }

        public async Task<GenericResponse<List<ManifestProvider>>> GetManifestDetailBySupplierAsync(int companyId, string manifestNumber)
        {
            GenericResponse<List<ManifestProvider>> result = new();

            var entities = await _repository.GetManifestDetailBySupplier(companyId, manifestNumber);
            if (entities != null)
            {
                result.Data = _mapper.Map<List<ManifestProvider>>(entities);
                result.Success = true;
            }

            return result;
        }

        public async Task<GenericResponse<List<Manifestdetail>>> GetManifestProductsDetailAsync(int companyId, string manifestNumber)
        {
            GenericResponse<List<Manifestdetail>> result = new();

            var entities = await _repository.GetManifestProductsDetail(companyId, manifestNumber);
            if (entities != null)
            {
                result.Data = _mapper.Map<List<Manifestdetail>>(entities);
                result.Success = true;
            }

            return result;
        } 
        public async Task<GenericResponse<List<ManifestProducts>>> GetManifestProductsAsync(int companyId, string manifestNumber)
        {
            GenericResponse<List<ManifestProducts>> result = new();

            var entities = await _repository.GetManifestProductsAsync(companyId, manifestNumber);
            if (entities != null)
            {
                result.Data = _mapper.Map<List<ManifestProducts>>(entities);
                result.Success = true;
            }

            return result;
        }
    }
}