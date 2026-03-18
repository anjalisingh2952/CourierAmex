using AutoMapper;
using CourierAmex.Models;
using CourierAmex.Storage;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Repositories;

namespace CourierAmex.Services
{
    public class PendingManifestOrPreStudyService : IPendingManifestOrPreStudyService
    {
        private readonly IPendingManifestOrPreStudyRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public PendingManifestOrPreStudyService(IMapper mapper, IPendingManifestOrPreStudyRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }
        public async Task<GenericResponse<List<PendingManifestOrPreStudyModel>>> Get_PendingManifestOrPreStudyAsync(int companyid, DateTime startDate, DateTime endDate, string reportType)
        {
            GenericResponse<List<PendingManifestOrPreStudyModel>> result = new();

            var entities = await _repository.Get_Report_PendingManifestOrPreStudy(companyid, startDate, endDate, reportType);
            if (null != entities)
            {
                result.Data = _mapper.Map<List<PendingManifestOrPreStudyModel>>(entities);
                result.Success = true;

            }

            return result;
        }
    }
}