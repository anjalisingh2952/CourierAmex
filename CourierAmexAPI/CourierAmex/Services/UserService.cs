using System.Web;

using AutoMapper;

using CourierAmex.Storage.Repositories;
using CourierAmex.Infrastructure;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage;
using CourierAmex.Models;

using EmailQueueStatus = CourierAmex.Models.EmailQueueStatus;

namespace CourierAmex.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repository;
        private readonly IEmailQueueService _emailQueueService;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public UserService(IMapper mapper, IUserRepository repository, IDalSession session, IEmailQueueService emailQueueService)
        {
            _mapper = mapper;
            _session = session;
            _repository = repository;
            _emailQueueService = emailQueueService;
        }

        public async Task<GenericResponse<UserModel>> GetByIdAsync(string id)
        {
            GenericResponse<UserModel> response = new();
            var entity = await _repository.GetByIdAsync(Guid.Parse(id));
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<UserModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<UserModel>> GetPagedAsync(FilterByRequest request)
        {
            PagedResponse<UserModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<UserModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<UserModel>> CreateAsync(UserModel entity, Guid userId)
        {
            GenericResponse<UserModel> result = new();
            var user = _mapper.Map<User>(entity);
            if (null != user)
            {
                user = await _repository.CreateOrUpdateAsync(user, userId);

                if (user?.Id.ToString().Length > 0)
                {
                    user.ResetKey = Guid.NewGuid();
                    user.ResetKeyExpireDate = DateTime.Now.AddHours(24);
                    await _repository.UpdateResetKeyAsync(user);

                    await SendNewUserEmailAsync(user);

                    result.Success = true;
                    result.Data = _mapper.Map<UserModel>(user);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<UserModel>> UpdateAsync(UserModel entity, Guid userId)
        {
            GenericResponse<UserModel> result = new();
            var user = await _repository.GetByIdAsync(Guid.Parse(entity.Id));
            if (null != user)
            {
                user = _mapper.Map(entity, user);
                user.ModifiedBy = userId;

                user = await _repository.CreateOrUpdateAsync(user, userId);
                if (user?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<UserModel>(user);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task DeleteAsync(string id, Guid userId)
        {
            var entity = await _repository.GetByIdAsync(Guid.Parse(id));
            if (null != entity)
            {
                entity.Status = BaseEntityStatus.Deleted;
                await _repository.CreateOrUpdateAsync(entity, userId);
            }

            _session.GetUnitOfWork().CommitChanges();
        }

        private async Task SendNewUserEmailAsync(User user)
        {
            string templatePath = Path.Combine(Environment.CurrentDirectory, "email-templates", "new-user.html");
            if (!File.Exists(templatePath))
            {
                throw new FileNotFoundException("Email template was not found.");
            }

            string htmlText = File.ReadAllText(templatePath);
            if (htmlText == null || htmlText.Length == 0)
            {
                throw new FileNotFoundException("Email template was not found.");
            }

            htmlText = htmlText.Replace("[USERNAME]", string.Concat(user.Name, " ", user.Lastname));
            htmlText = htmlText.Replace("[RESETLINK]", string.Concat("?key=", HttpUtility.UrlEncode(user.ResetKey.ToString())));

            var emailBody = new EmailBody
            {
                Title = "New Account Created",
                Subject = "New Account Created",
                Text = htmlText,
                IsHtml = true,
                Status = EmailQueueStatus.Pending
            };

            if (string.IsNullOrEmpty(user.Email))
            {
                await _emailQueueService.CreateAsync(user.Email ?? "", emailBody);
            }
        }

        public async Task<GenericResponse<bool>> CreatePasswordAsync(ResetRequest entity, Guid userId)
        {
            GenericResponse<bool> result = new();
            var user = await _repository.GetByIdAsync(Guid.Parse(entity.UserId));
            if (null != user)
            {
                CustomPasswordHasher hasher = new();
                user.PasswordHash = hasher.HashPassword(entity.Password ?? "");
                user.ChangePassword = true;
                user = await _repository.CreateOrUpdateAsync(user, userId);
                if (user != null && user.Id.ToString().Length > 0)
                {
                    result = new GenericResponse<bool>
                    {
                        Success = true,
                    };
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<bool>> ChangePasswordAsync(ChangePasswordModel request, Guid userId)
        {
            GenericResponse<bool> result = new()
            {
                Message = "UserProfile.InvalidInformation",
                Success = false
            };

            var userGuid = Guid.Parse(request.Id);
            if (userGuid.Equals(userId))
            {
                var user = await _repository.GetByIdAsync(Guid.Parse(request.Id));
                if (null != user)
                {
                    CustomPasswordHasher hasher = new();
                    var passwordHash = user.PasswordHash ?? "";
                    if (hasher.VerifyPassword(passwordHash, request.CurrentPassword))
                    {
                        user.ChangePassword = false;
                        user.PasswordHash = hasher.HashPassword(request.NewPassword ?? "");
                        await _repository.CreateOrUpdateAsync(user, userId);

                        result.Success = true;
                        result.Message = "";
                    }
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }
    }
}
