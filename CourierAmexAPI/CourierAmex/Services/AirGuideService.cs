using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using Dapper;
using System.Data;

namespace CourierAmex.Services
{
    public class AirGuideService: IAirGuideService
    {
        private readonly IAirGuideRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public AirGuideService(IMapper mapper, IAirGuideRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<IEnumerable<AirGuideModel>> GetAirGuidesByIdAsync(int manifestId, int companyId)
        {
            var entities = await _repository.GetAirGuidesByIdAsync(manifestId, companyId);
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<AirGuideModel>>(entities);
            }

            return new List<AirGuideModel>();

        }

        public async Task<IEnumerable<GuideDetailModel>> GetGuideById(int guideId)
        {
            var entities = await _repository.GetGuideByIdAsync(guideId);
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<GuideDetailModel>>(entities);
            }

            return new List<GuideDetailModel>();

        }

        public async Task<IEnumerable<MasterGuideModel>> GetMasterGuide(int manifestId)
        {
            var entities = await _repository.GetMasterGuideAsync(manifestId);
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<MasterGuideModel>>(entities);
            }

            return new List<MasterGuideModel>();

        }

        public async Task<IEnumerable<AirGuideModel>> GetAirGuideByManifestIdAsync(int manifestId)
        {
            var entities = await _repository.GetAirGuideByManifestIdAsync(manifestId);
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<AirGuideModel>>(entities);
            }
            return new List<AirGuideModel>();
        }

        public async Task<IEnumerable<PackageCategoryModel>> GetPackagesByAirGuideByManifestId(int manifestId, string guideNumber, int companyId = 0)
        {
            var entities = await _repository.GetPackagesByAirGuideByManifestId(manifestId, guideNumber, companyId);
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<PackageCategoryModel>>(entities);
            }
            return new List<PackageCategoryModel>();
        }

        public async Task<int> CreateOrUpdateMasterGuide(MasterGuideModel model)
        {
            var masterGuide = _mapper.Map<Entities.MasterGuide>(model);
            var entity = await _repository.CreateOrUpdateMasterGuideAsync(masterGuide);

            return entity;
        }

        public async Task<int> DeleteAirGuide(int Id, int masterId, Guid userId)
        {
            var entity = await _repository.DeleteAirGuideAsync(Id,masterId,userId);
            return entity;
        }

        public async Task<int> AssignManifestPackageToGuide(int packagenumber, int ManifestId, string childGuide, Guid user)
        {
            var entity = await _repository.AssignManifestPackageToGuideAsync(packagenumber, ManifestId, childGuide,user);
            return entity;
        }

        public async Task<int> CreateOrUpdateChildGuide(ChildGuideModel model)
        {
            var childGuide = _mapper.Map<Entities.ChildGuide>(model);
            var entity = await _repository.CreateOrUpdateChildGuideAsync(childGuide);

            return entity;
        }

    }
}
